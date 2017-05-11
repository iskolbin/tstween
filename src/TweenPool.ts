import { now } from 'tsnow'
import { Tween, TweenedProperties } from './Tween'

export class TweenPool {
	protected _tweens: Tween<any>[] = []
	
	seek<T>( obj: T, properties: TweenedProperties<T>, duration: number = 1000 ): Tween<T> {
		return new Tween<T>( this, obj, properties, duration )
	}

	move<T>( obj: T, properties: TweenedProperties<T>, duration: number = 1000 ): Tween<T> {
		const moveProperties: TweenedProperties<T> = (<any>{})
		for ( const k in properties ) {
			moveProperties[k] = (<any>obj)[k] + properties[k]
		}
		return this.seek<T>( obj, moveProperties, duration )
	}

	add( tween: Tween<any> ): TweenPool {
		this._tweens.push( tween )
		return this
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

	get size(): number {
		return this._tweens.length
	}
}
