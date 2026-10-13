import { describe, test, expect, jest } from '@jest/globals';

import { validateName, validateEmail, validatePhone, validatePassword, validatePasswords, validatePincode, validateCoordinates, setLimitAndOffset, getAuthorizedList, Authorize, checkRateLimit } from '../src/shared.js';

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe('Input validation', () => {
    describe('validateName', () => {
        test.each([
            ['valid name', 'Alex', true],
            ['empty name', '', false],
            ['non-string name', 42, false],
            ['null name', null, false],
            ['name at maximum boundary', 'a'.repeat(32), false],
        ])('%s', (_label, value, expected) => {
            expect(Boolean(validateName(value))).toBe(expected);
        });
    });

    describe('validateEmail', () => {
        test.each([
            ['valid email', 'tester@example.com', true],
            ['missing domain', 'tester@', false],
            ['missing local part', '@example.com', false],
            ['oversized email', `${'a'.repeat(250)}@example.com`, false],
            ['null email', null, false],
        ])('%s', (_label, value, expected) => {
            expect(Boolean(validateEmail(value))).toBe(expected);
        });
    });

    describe('validatePhone', () => {
        test.each([
            ['valid phone', '9876543210', true],
            ['too short', '987654321', false],
            ['alphabetic characters', '98765abcde', false],
            ['international prefix', '+919876543210', false],
            ['empty phone', '', false],
        ])('%s', (_label, value, expected) => {
            expect(Boolean(validatePhone(value))).toBe(expected);
        });
    });

    describe('validatePassword', () => {
        test.each([
            ['strong password', 'Strong@123', true],
            ['missing uppercase', 'strong@123', false],
            ['missing special character', 'Strong123', false],
            ['too short', 'Aa@1', false],
            ['unsupported punctuation', 'Strong#123', false],
        ])('%s', (_label, value, expected) => {
            expect(Boolean(validatePassword(value))).toBe(expected);
        });
    });

    test('password confirmation requires matching valid passwords', () => {
        expect(validatePasswords('Strong@123', 'Strong@123')).toBe(true);
        expect(validatePasswords('Strong@123', 'Strong@124')).toBe(false);
        expect(validatePasswords('weak', 'weak')).toBe(false);
    });

    describe('validatePincode', () => {
        test.each([
            ['valid six-digit pincode', '580001', true],
            ['numeric value instead of string', 580001, true],
            ['five digits', '58001', false],
            ['letters included', '58A001', false],
            ['empty value', '', false],
        ])('%s', (_label, value, expected) => {
            expect(Boolean(validatePincode(value))).toBe(expected);
        });
    });

    describe('validateCoordinates', () => {
        test.each([
            [0, 0, true],
            [90, 180, true],
            [-90, -180, true],
            [90.01, 0, false],
            [-90.01, 0, false],
            [0, 180.01, false],
            [0, -180.01, false],
            [NaN, 0, false],
            [0, Infinity, false],
            [undefined, 0, false],
            [null, null, false],
        ])('latitude=%s, longitude=%s', (lat, lon, expected) => {
            expect(validateCoordinates(lat, lon)).toBe(expected);
        });
    });
});

describe('Pagination middleware', () => {
    test('uses safe defaults when query values are absent', () => {
        const req = { query: {} };
        const next = jest.fn();

        setLimitAndOffset(req, createResponse(), next);

        expect(req.limit).toBeGreaterThan(0);
        expect(req.offset).toBe(0);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('caps excessive limits and prevents negative offsets', () => {
        const req = {
            query: { limit: '999999', offset: '-50' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(req.limit).toBeLessThanOrEqual(20);
        expect(req.limit).toBeGreaterThan(0);
        expect(req.offset).toBeGreaterThanOrEqual(0);
    });

    test('calculates offset using the effective capped limit', () => {
        const req = {
            query: { limit: '999999', offset: '3' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());
        expect(req.offset).toBe(req.limit * 2);
    });

    test('normalizes fractional limits consistently', () => {
        const req = {
            query: { limit: '2.5', offset: '3' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(Number.isInteger(req.limit)).toBe(true);
        expect(Number.isInteger(req.offset)).toBe(true);
        expect(req.offset).toBe(req.limit * 2);
    });

    test('malformed query parameters do not produce NaN values', () => {
        const req = {
            query: { limit: 'abc', offset: 'xyz' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(Number.isInteger(req.limit)).toBe(true);
        expect(Number.isInteger(req.offset)).toBe(true);
        expect(req.limit).toBeGreaterThan(0);
        expect(req.offset).toBeGreaterThanOrEqual(0);
    });

    test('handles zero and negative limits safely', () => {
        const req = {
            query: { limit: '0', offset: '-1' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(req.limit).toBeGreaterThan(0);
        expect(req.offset).toBeGreaterThanOrEqual(0);
    });
});

describe('Authorization policy', () => {
    test('admin role receives admin resources', () => {
        const resources = getAuthorizedList(0, 1);

        expect(resources).toContain('get_admin');
        expect(resources).toContain('delete_user');
    });

    test('regular users cannot access admin resources', () => {
        const resources = getAuthorizedList(0, 0);

        expect(resources).not.toContain('get_admin');
        expect(resources).not.toContain('delete_user');
        expect(resources).toContain('post_garage');
    });

    test('mechanics receive mechanic resources without admin access', () => {
        const resources = getAuthorizedList(1, 0);

        expect(resources).toContain('get_booking_mechanic');
        expect(resources).not.toContain('get_admin');
    });

    test('denies authorization when the user does not exist', async () => {
        const connection = {
            query: jest.fn().mockResolvedValue([[], []]),
        };

        await expect(Authorize(999, 'admin_page', connection)).resolves.toBe(
            false,
        );
    });

    test('checks resources against the role allowlist', async () => {
        const connection = {
            query: jest
                .fn()
                .mockResolvedValue([[{ IS_MECHANIC: 0, IS_ADMIN: 0 }], []]),
        };

        await expect(Authorize(7, 'admin_page', connection)).resolves.toBe(
            false,
        );

        await expect(Authorize(7, 'index_page', connection)).resolves.toBe(
            true,
        );
    });

    test('does not grant access when the database query fails', async () => {
        const connection = {
            query: jest
                .fn()
                .mockRejectedValue(new Error('Database unavailable')),
        };

        try {
            const result = await Authorize(7, 'admin_page', connection);

            expect(result).toBe(false);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});

describe('Rate limiting', () => {
    const createRequest = (overrides = {}) => ({
        app: {
            get: (key) =>
                ({
                    globalRate: 0,
                    ipRate: 10,
                    ip_limit: {},
                    userRate: 10,
                    user_limit: {},
                })[key],
            set: jest.fn(),
        },
        ip: '127.0.0.1',
        path: '/test',
        method: 'GET',
        user: 1,
        ...overrides,
    });

    test('returns HTTP 429 when global budget is exhausted', async () => {
        const req = createRequest();
        const res = createResponse();
        const next = jest.fn();

        await checkRateLimit(req, res, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(next).not.toHaveBeenCalled();
    });

    test('does not call next when a request is rate limited', async () => {
        const req = createRequest();
        const res = createResponse();
        const next = jest.fn();

        await checkRateLimit(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });
});

describe('Performance and reliability safeguards', () => {
    test('pagination does not allow unbounded result limits', () => {
        const req = {
            query: { limit: '100000000', offset: '0' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(req.limit).toBeLessThanOrEqual(20);
    });

    test('pagination produces finite numeric values', () => {
        const req = {
            query: { limit: '10', offset: '2' },
        };

        setLimitAndOffset(req, createResponse(), jest.fn());

        expect(Number.isFinite(req.limit)).toBe(true);
        expect(Number.isFinite(req.offset)).toBe(true);
    });
});

describe('Compatibility and malformed inputs', () => {
    test.each([
        ['null', null],
        ['undefined', undefined],
        ['number', 123],
        ['object', {}],
        ['array', []],
    ])('name validator handles %s input without crashing', (_label, value) => {
        expect(() => validateName(value)).not.toThrow();
    });

    test.each([
        ['null', null],
        ['undefined', undefined],
        ['number', 123],
        ['object', {}],
    ])('email validator handles %s input without crashing', (_label, value) => {
        expect(() => validateEmail(value)).not.toThrow();
    });
});
