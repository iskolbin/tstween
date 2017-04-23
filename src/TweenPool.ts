import { now } from './now'
import { Tween } from './Tween'

export class TweenPool {
	protected _tweens: Tween<any>[] = []

	add( tween: Tween<any> ): number {
		return this._tweens.push( tween )
	}

	tween<T>( o: T ): Tween<T> {
		return new Tween( this, o )
	}

	clear(): void {
		this._tweens = []
	}

	delete( tween: Tween<any> ): boolean {
		const { _tweens } = this
		const i = _tweens.indexOf(tween)
		if (i !== -1) {
			_tweens.splice(i, 1);
			return true
		} else {
			return false
		}
	}

	has( tween: Tween<any> ): boolean {
		return this._tweens.indexOf( tween ) !== -1
	}

	update( time: number = now(), preserve: boolean = false ): boolean {
		const { _tweens } = this
		if ( _tweens.length === 0 ) {
			return false
		}

		let i = 0

		while (i < _tweens.length) {
			if ( _tweens[i].update( time ) || preserve ) {
				i++
			} else {
				_tweens.splice( i, 1 )
			}
		}

		return true
	}

	tweens(): Tween<any>[] {
		return this._tweens
	}

	get size(): number {
		return this._tweens.length
	}
}
