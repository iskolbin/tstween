import {Linear as LinearUtil, Bernstein, CatmullRom as CatmullRomUtil} from './InterpolationUtils'

export function Linear( v: number[], k: number ): number {
	const m = v.length - 1
	const f = m * k
	const i = Math.floor( f )
	if (k < 0) {
		return LinearUtil( v[0], v[1], f)
	} else if (k > 1) {
		return LinearUtil( v[m], v[m - 1], m - f )
	}
	return LinearUtil( v[i], v[i + 1 > m ? m : i + 1], f - i )
}

export function Bezier( v: number[], k: number ): number {
	let b = 0
	const n = v.length - 1
	const pw = Math.pow
	for ( let i = 0; i <= n; i++ ) {
		b += pw( 1 - k, n - i ) * pw( k, i ) * v[i] * Bernstein( n, i )
	}
	return b
}

export function CatmullRom( v: number[], k: number ): number {
	const m = v.length - 1
	let f = m * k
	let i = Math.floor( f )
	if ( v[0] === v[m] ) {
		if ( k < 0 ) {
			i = Math.floor( f = m * ( 1 + k ))
		}
		return CatmullRomUtil( v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i )
	} else {
		if ( k < 0 ) {
			return v[0] - ( CatmullRomUtil( v[0], v[0], v[1], v[1], -f ) - v[0] )
		} else if ( k > 1 ) {
			return v[m] - ( CatmullRomUtil( v[m], v[m], v[m - 1], v[m - 1], f - m ) - v[m] )
		} else {
			return CatmullRomUtil( v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i )
		}	
	}
}
