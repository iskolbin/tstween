function line( p0: number, p1: number, t: number ): number {
	return ( p1 - p0 ) * t + p0
}

const factorialCache = [1]

function factorial( n: number ): number {
	for ( let i = factorialCache.length; i <= n; i++ ) {
		factorialCache[i] = factorialCache[i-1]*i
	}
	return factorialCache[n]
}

function bernstein( n: number, i: number ): number {
	return factorial( n ) / factorial( i ) / factorial( n - i )
}

function catmullRom( p0: number, p1: number, p2: number, p3: number, t: number ) {
	const v0 = (p2 - p0) * 0.5
	const v1 = (p3 - p1) * 0.5
	const t2 = t * t
	const t3 = t * t2

	return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}

export function Line( v: number[], k: number ): number {
	const m = v.length - 1
	const f = m * k
	const i = Math.floor( f )

	if (k < 0) {
		return line( v[0], v[1], f)
	} else if (k > 1) {
		return line( v[m], v[m - 1], m - f )
	} else {
		return line( v[i], v[i + 1 > m ? m : i + 1], f - i )
	}	
}

export function Bezier( v: number[], k: number ): number {
	const n = v.length - 1
	let b = 0
	for ( let i = 0; i <= n; i++ ) {
		b += Math.pow( 1 - k, n - i ) * Math.pow( k, i ) * v[i] * bernstein( n, i )
	}
	return b
}

export function CatmullRom( v: number[], k: number ): number {
	const m = v.length - 1
	let f = m * k
	let i = Math.floor(f);
	if (v[0] === v[m]) {
		if (k < 0) {
			f = m * ( 1 + k )
			i = Math.floor( f )
		}
		return catmullRom( v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i )
	} else {
		if ( k < 0 ) {
			return v[0] - (catmullRom( v[0], v[0], v[1], v[1], -f ) - v[0])
		} else if (k > 1) {
			return v[m] - (catmullRom( v[m], v[m], v[m - 1], v[m - 1], f - m ) - v[m])
		} else {
			return catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i)
		}	
	}
}
