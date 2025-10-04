// Memory monitoring utility for 500MB RAM hosting
// Helps track and prevent out-of-memory crashes

function formatBytes(bytes) {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
}

function getMemoryStats() {
    const usage = process.memoryUsage();
    return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        rss: usage.rss,
        external: usage.external,
        heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
        rssMB: Math.round(usage.rss / 1024 / 1024),
    };
}

function logMemoryUsage(label = 'Memory') {
    const stats = getMemoryStats();
    console.log(`📊 ${label}: Heap ${stats.heapUsedMB}/${stats.heapTotalMB}MB | RSS ${stats.rssMB}MB`);
    
    // Warn if approaching 500MB limit
    if (stats.rssMB > 450) {
        console.warn(`⚠️ HIGH MEMORY WARNING: ${stats.rssMB}MB RSS (approaching 500MB limit)`);
    }
    
    return stats;
}

function isMemoryCritical() {
    const stats = getMemoryStats();
    // Critical if using more than 450MB
    return stats.rssMB > 450 || stats.heapUsedMB > 400;
}

function forceGarbageCollection() {
    if (global.gc) {
        const before = getMemoryStats();
        global.gc();
        const after = getMemoryStats();
        const freed = before.heapUsedMB - after.heapUsedMB;
        if (freed > 0) {
            console.log(`🧹 GC freed ${freed}MB`);
        }
        return freed;
    }
    return 0;
}

// Start periodic memory logging (every 15 minutes)
function startMemoryMonitoring(intervalMinutes = 15) {
    setInterval(() => {
        logMemoryUsage('Periodic Check');
        if (isMemoryCritical() && global.gc) {
            console.log('🧹 Running garbage collection due to high memory...');
            forceGarbageCollection();
        }
    }, intervalMinutes * 60 * 1000);
}

module.exports = {
    getMemoryStats,
    logMemoryUsage,
    isMemoryCritical,
    forceGarbageCollection,
    startMemoryMonitoring,
};
