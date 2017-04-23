import { TweenPool } from './TweenPool'
import { Linear as LinearInterpolation } from './Interpolation'
import { Linear as LinearEasing } from './Easing'
import { now } from './now'

export type Easing = ( value: number ) => number

export type Interpolation = ( points: number[], value: number ) => number

export type StartCallback = ( o: Object ) => void

export type UpdateCallback = ( o: Object ) => void

export type CompleteCallback = ( o: Object ) => void

export type StopCallback = ( o: Object ) => void

// TODO refactor any
export type TweenPartial<T> = { [P in keyof T]: any }

export class Tween<T> {
	protected _valuesStart: TweenPartial<T>
	protected _valuesEnd: TweenPartial<T>
	protected _valuesStartRepeat: TweenPartial<T>
	protected _duration = 1000
	protected _repeat = 0
	protected _repeatDelayTime?: number = undefined
	protected _yoyo = false
	protected _isPlaying = false
	protected _reversed = false
	protected _delayTime = 0
	protected _startTime = -1
	protected _easingFunction: Easing = LinearEasing
	protected _interpolationFunction: Interpolation = LinearInterpolation
	protected _chainedTweens: Tween<any>[] = []
	protected _onStartCallback?: StartCallback
	protected _onStartCallbackFired = false
	protected _onUpdateCallback?: UpdateCallback
	protected _onCompleteCallback?: CompleteCallback
	protected _onStopCallback?: StopCallback

	constructor( 
		protected _pool: TweenPool,
		protected _object: T ) {
	}

	to( properties: TweenPartial<T>, duration?: number ): Tween<T> {
		this._valuesEnd = properties
		if ( duration !== undefined ) {
			this._duration = duration
		}
		return this
	}

	start( time?: number ): Tween<T> {
		this._pool.add( this )

		this._isPlaying = true
		this._onStartCallbackFired = false
		this._startTime = time !== undefined ? time : now()
		this._startTime += this._delayTime

		const {_valuesStart,_valuesStartRepeat,_valuesEnd,_object} = this

		for ( const property in _valuesEnd ) {
			// Check if an Array was provided as property value
			if ( _valuesEnd[property] instanceof Array ) {
				const endValue: any = _valuesEnd[property]
				if ( endValue.length === 0 ) {
					continue
				}
				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property])
			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if ( _object[property] === undefined ) {
				continue
			}

			// Save the starting value.
			_valuesStart[property] = Number( _object[property] )
			if ( _valuesStart[property] !== undefined && (_valuesStart[property] instanceof Array) === false ) {
				_valuesStart[property] *= 1.0 // Ensures we're using numbers, not strings
			}
			_valuesStartRepeat[property] = _valuesStart[property] || 0
		}
		return this
	}

	stop(): Tween<T> {
		if ( !this._isPlaying ) {
			return this
		}

		this._pool.delete( this )
		this._isPlaying = false

		if ( this._onStopCallback ) {
			this._onStopCallback.call( this._object, this._object )
		}

		return this.stopChainedTweens()
	}

	end(): Tween<T> {
		this.update( this._startTime + this._duration )
		return this
	}

	stopChainedTweens(): Tween<T> {
		const numChainedTweens = this._chainedTweens.length
		for ( let i = 0; i < numChainedTweens; i++ ) {
			this._chainedTweens[i].stop()
		}
		return this
	}

	delay( amount: number ): Tween<T> {
		this._delayTime = amount
		return this
	}

	repeat( times: number ): Tween<T> {
		this._repeat = times
		return this
	}

	repeatDelay( amount: number ): Tween<T> {
		this._repeatDelayTime = amount
		return this
	}

	yoyo( yoyo: boolean ): Tween<T> {
		this._yoyo = yoyo
		return this
	}

	easing( easing: Easing ): Tween<T> {
		this._easingFunction = easing
		return this
	}

	interpolation( interpolation: Interpolation ): Tween<T> {
		this._interpolationFunction = interpolation
		return this
	}

	chain( ...tweens: Tween<any>[] ): Tween<T> {
		this._chainedTweens = tweens
		return this
	}

	onStart( callback: StartCallback ): Tween<T> {
		this._onStartCallback = callback
		return this
	}

	onUpdate( callback: UpdateCallback ): Tween<T> {
		this._onUpdateCallback = callback
		return this
	}

	onComplete( callback: CompleteCallback ): Tween<T> {
		this._onCompleteCallback = callback
		return this
	}

	onStop( callback: StopCallback ): Tween<T> {
		this._onStopCallback = callback
		return this
	}

	update( time: number ): boolean {
		const {_startTime} = this
		
		if ( time < _startTime ) {
			return true
		}
		
		const {_valuesStart,_valuesEnd,_object,_duration} = this

		if ( this._onStartCallbackFired === false ) {
			if ( this._onStartCallback ) {
				this._onStartCallback.call( _object, _object )
			}
			this._onStartCallbackFired = true
		} 

		let elapsed = (time - _startTime) / _duration
		elapsed = elapsed > 1 ? 1 : elapsed

		const value: number = this._easingFunction( elapsed )

		for ( let property in _valuesEnd ) {
			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue
			}

			const start: number = _valuesStart[property]
			// TODO remove any
			const end: any = _valuesEnd[property]
			//const end: number | string = _valuesEnd[property]

			const {_interpolationFunction} = this
			if ( end instanceof Array ) {// Array<any> ) {
				// TODO it's hack
				(<any>_object)[property] = _interpolationFunction( end, value )
			} else  {
				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof end === 'string' ) {
					let end_: number
					if ( (<string>end).charAt(0) === '+' || (<string>end).charAt(0) === '-' ) {
						end_ = start + parseFloat( end )
					} else {
						end_ = parseFloat( end )
					}
					// TODO it's hack
					(<any>_object)[property] = start + (end_ - start) * value
				}
			}
		}

		if ( this._onUpdateCallback ) {
			this._onUpdateCallback.call( _object, value )
		}

		if ( elapsed === 1 ) {
			const {_repeat,_valuesStartRepeat,_yoyo,_reversed,_repeatDelayTime} = this
			if ( _repeat > 0 ) {
				if ( isFinite( _repeat )) {
					this._repeat--
				}

				// Reassign starting values, restart by making startTime = now
				for ( const property in _valuesStartRepeat ) {
					if ( typeof _valuesEnd[property] === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + _valuesEnd[property]
					}

					if ( _yoyo ) {
						const tmp = _valuesStartRepeat[property]
						_valuesStartRepeat[property] = _valuesEnd[property]
						_valuesEnd[property] = tmp
					}
					_valuesStart[property] = _valuesStartRepeat[property]
				}

				if (_yoyo) {
					this._reversed = !_reversed
				}

				if (_repeatDelayTime !== undefined) {
					this._startTime = time + _repeatDelayTime
				} else {
					this._startTime = time + this._delayTime
				}
				return true

			} else {
				const {_onCompleteCallback,_chainedTweens,_startTime} = this
				if (_onCompleteCallback ) {
					_onCompleteCallback.call(_object, _object)
				}
				const numChainedTweens = _chainedTweens.length
				for ( let i = 0; i < numChainedTweens; i++ ) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start( _startTime + _duration )
				}
				return false
			}
		}

		return true
	}
}
