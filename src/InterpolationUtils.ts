export function Linear( p0: number, p1: number, t: number ): number {
	return ( p1 - p0 ) * t + p0
}

const a = [1]
export function Factorial( n: number ): number {
	if ( a.length > n ) {
		return a[n]
	}
	
	let s = 1

	for ( let i = n; i > 1; i-- ) {
		s *= i
	}

	a[n] = s
	return s
}

export function Bernstein( n: number, i: number ): number {
	return Factorial( n ) / Factorial( i ) / Factorial( n - i )
}

export function CatmullRom( p0: number, p1: number, p2: number, p3: number, t: number ) {
	const v0 = (p2 - p0) * 0.5
	const v1 = (p3 - p1) * 0.5
	const t2 = t * t
	const t3 = t * t2

	return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}
