let now: () => number

declare const process: any

if ( typeof window === 'undefined' && typeof process !== 'undefined' ) {
	// In node.js, use process.hrtime.
	now = function () {
		const [seconds, nanoseconds] = process.hrtime()
		return seconds * 1000 + nanoseconds / 1000000;
	}
} else if ( typeof window !== 'undefined' &&
	// In a browser, use window.performance.now if it is available.
	window.performance !== undefined &&
	window.performance.now !== undefined) {
		// This must be bound, because directly assigning this function
		// leads to an invocation exception in Chrome.
		now = window.performance.now.bind( window.performance )
} else if (Date.now !== undefined) {
	// Use Date.now if it is available.
	now = Date.now
} else {
	// Otherwise, use 'new Date().getTime()'.
	now = () => new Date().getTime()
}

export { now }
