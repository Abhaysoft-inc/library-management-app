/**
 * Request/Response Logging Middleware
 * Logs all incoming requests and outgoing responses
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    // Text colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
};

// Get color based on status code
const getStatusColor = (statusCode) => {
    if (statusCode >= 500) return colors.red;
    if (statusCode >= 400) return colors.yellow;
    if (statusCode >= 300) return colors.cyan;
    if (statusCode >= 200) return colors.green;
    return colors.white;
};

// Get color based on HTTP method
const getMethodColor = (method) => {
    const methodColors = {
        GET: colors.blue,
        POST: colors.green,
        PUT: colors.yellow,
        DELETE: colors.red,
        PATCH: colors.magenta,
    };
    return methodColors[method] || colors.white;
};

// Format response time with color
const formatResponseTime = (ms) => {
    if (ms < 100) return `${colors.green}${ms}ms${colors.reset}`;
    if (ms < 500) return `${colors.yellow}${ms}ms${colors.reset}`;
    return `${colors.red}${ms}ms${colors.reset}`;
};

// Format file size
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Request Logger Middleware
 * Logs incoming requests and outgoing responses
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Store original send function
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.json to log response
    res.json = function (data) {
        res.locals.responseBody = data;
        return originalJson.call(this, data);
    };

    // Override res.send to log response
    res.send = function (data) {
        res.locals.responseBody = data;
        return originalSend.call(this, data);
    };

    // Log when response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusColor = getStatusColor(res.statusCode);
        const methodColor = getMethodColor(req.method);

        // Basic request info
        console.log('\n' + colors.dim + '─'.repeat(80) + colors.reset);
        console.log(
            `${colors.dim}[${timestamp}]${colors.reset} ` +
            `${methodColor}${colors.bright}${req.method}${colors.reset} ` +
            `${colors.cyan}${req.originalUrl}${colors.reset} ` +
            `${statusColor}${res.statusCode}${colors.reset} ` +
            `${formatResponseTime(duration)}`
        );

        // User info (if authenticated)
        if (req.user) {
            console.log(
                `${colors.dim}👤 User:${colors.reset} ${req.user.name} ` +
                `${colors.dim}(${req.user.role})${colors.reset} ` +
                `${colors.dim}[${req.user.email}]${colors.reset}`
            );
        }

        // Request details
        if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
            console.log(`${colors.dim}📥 Request Body:${colors.reset}`);

            // Hide sensitive fields
            const sanitizedBody = { ...req.body };
            if (sanitizedBody.password) sanitizedBody.password = '***';
            if (sanitizedBody.passwordResetToken) sanitizedBody.passwordResetToken = '***';

            console.log(colors.dim + JSON.stringify(sanitizedBody, null, 2) + colors.reset);
        }

        // Query parameters
        if (Object.keys(req.query).length > 0) {
            console.log(
                `${colors.dim}🔍 Query:${colors.reset} ` +
                JSON.stringify(req.query)
            );
        }

        // Response details
        if (res.locals.responseBody) {
            const responseStr = typeof res.locals.responseBody === 'string'
                ? res.locals.responseBody
                : JSON.stringify(res.locals.responseBody);

            const responseSize = Buffer.byteLength(responseStr, 'utf8');

            console.log(
                `${colors.dim}📤 Response Size:${colors.reset} ${formatBytes(responseSize)}`
            );

            // Log response body for errors or in development
            if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
                try {
                    const responseData = typeof res.locals.responseBody === 'string'
                        ? JSON.parse(res.locals.responseBody)
                        : res.locals.responseBody;

                    // Show success/error message
                    if (responseData.message) {
                        const messageColor = responseData.success ? colors.green : colors.red;
                        console.log(
                            `${colors.dim}💬 Message:${colors.reset} ` +
                            `${messageColor}${responseData.message}${colors.reset}`
                        );
                    }

                    // Show error details
                    if (responseData.error) {
                        console.log(
                            `${colors.red}❌ Error:${colors.reset} ${responseData.error}`
                        );
                    }

                    // Show data summary for successful responses
                    if (responseData.success && responseData.data) {
                        if (Array.isArray(responseData.data)) {
                            console.log(
                                `${colors.dim}📊 Data:${colors.reset} Array with ${responseData.data.length} items`
                            );
                        } else if (typeof responseData.data === 'object') {
                            const keys = Object.keys(responseData.data);
                            console.log(
                                `${colors.dim}📊 Data:${colors.reset} Object with keys: ${keys.join(', ')}`
                            );
                        }
                    }
                } catch (e) {
                    // If parsing fails, just show truncated response
                    const truncated = responseStr.substring(0, 200);
                    console.log(
                        `${colors.dim}📤 Response:${colors.reset} ${truncated}${responseStr.length > 200 ? '...' : ''}`
                    );
                }
            }
        }

        // IP Address
        const ip = req.ip || req.connection.remoteAddress;
        console.log(`${colors.dim}🌐 IP:${colors.reset} ${ip}`);

        console.log(colors.dim + '─'.repeat(80) + colors.reset);
    });

    next();
};

/**
 * Error Logger Middleware
 * Logs detailed error information
 */
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();

    console.error('\n' + colors.bgRed + colors.white + ' ERROR ' + colors.reset);
    console.error(colors.dim + '─'.repeat(80) + colors.reset);
    console.error(`${colors.dim}[${timestamp}]${colors.reset}`);
    console.error(`${colors.red}${colors.bright}${err.name}: ${err.message}${colors.reset}`);
    console.error(`${colors.dim}Route:${colors.reset} ${req.method} ${req.originalUrl}`);

    if (req.user) {
        console.error(
            `${colors.dim}User:${colors.reset} ${req.user.email} (${req.user.role})`
        );
    }

    if (err.stack) {
        console.error(`${colors.dim}Stack Trace:${colors.reset}`);
        console.error(colors.red + err.stack + colors.reset);
    }

    console.error(colors.dim + '─'.repeat(80) + colors.reset + '\n');

    next(err);
};

/**
 * Simple request counter for statistics
 */
let requestStats = {
    total: 0,
    byMethod: {},
    byStatus: {},
    errors: 0,
};

const statsLogger = (req, res, next) => {
    requestStats.total++;
    requestStats.byMethod[req.method] = (requestStats.byMethod[req.method] || 0) + 1;

    res.on('finish', () => {
        const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;
        requestStats.byStatus[statusGroup] = (requestStats.byStatus[statusGroup] || 0) + 1;

        if (res.statusCode >= 400) {
            requestStats.errors++;
        }
    });

    next();
};

/**
 * Get request statistics
 */
const getStats = () => {
    return {
        ...requestStats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    };
};

/**
 * Log statistics periodically (optional)
 */
const logStatsPeriodically = (intervalMinutes = 60) => {
    setInterval(() => {
        const stats = getStats();
        console.log('\n' + colors.blue + colors.bright + '📊 SERVER STATISTICS' + colors.reset);
        console.log(colors.dim + '─'.repeat(80) + colors.reset);
        console.log(`Total Requests: ${colors.cyan}${stats.total}${colors.reset}`);
        console.log(`Errors: ${colors.red}${stats.errors}${colors.reset}`);
        console.log(`Uptime: ${colors.green}${Math.floor(stats.uptime / 60)} minutes${colors.reset}`);
        console.log('\nBy Method:');
        Object.entries(stats.byMethod).forEach(([method, count]) => {
            console.log(`  ${method}: ${count}`);
        });
        console.log('\nBy Status:');
        Object.entries(stats.byStatus).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        console.log(colors.dim + '─'.repeat(80) + colors.reset + '\n');
    }, intervalMinutes * 60 * 1000);
};

module.exports = {
    requestLogger,
    errorLogger,
    statsLogger,
    getStats,
    logStatsPeriodically,
};
