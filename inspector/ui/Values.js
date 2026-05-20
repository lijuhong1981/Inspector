import { EventDispatcher } from 'three';

class Value extends EventDispatcher {

	constructor() {

		super();

		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'param-control';

		this._onChangeFunction = null;

		this.addEventListener( 'change', ( e ) => {

			// defer to avoid issues when changing multiple values in the same call stack

			requestAnimationFrame( () => {

				if ( this._onChangeFunction ) this._onChangeFunction( e.value );

			} );

		} );

	}

	setValue( /*val*/ ) {

		this.dispatchChange();

		return this;

	}

	getValue() {

		return null;

	}

	dispatchChange() {

		this.dispatchEvent( { type: 'change', value: this.getValue() } );

	}

	onChange( callback ) {

		this._onChangeFunction = callback;

		return this;

	}

}

class ValueNumber extends Value {

	constructor( { value = 0, step = 0.1, min = - Infinity, max = Infinity } ) {

		super();

		this.input = document.createElement( 'input' );
		this.input.type = 'number';
		// @reviser lijuhong 注释掉直接设置step、value值的代码，后面调用链式方法设置step、value值
		// this.input.value = value;
		// this.input.step = step;
		this.input.min = min;
		this.input.max = max;
		// @reviser lijuhong 链式设置step、value值
		this.step(step).setValue( value );
		this.input.addEventListener( 'change', this._onChangeValue.bind( this ) );
		this.domElement.appendChild( this.input );
		this.addDragHandler();

	}

	_onChangeValue() {

		const value = parseFloat( this.input.value );
		const min = parseFloat( this.input.min );
		const max = parseFloat( this.input.max );

		if ( value > max ) {

			this.input.value = max;

		} else if ( value < min ) {

			this.input.value = min;

		} else if ( isNaN( value ) ) {

			this.input.value = min;

		}

		this.dispatchChange();

	}

	addDragHandler() {

		let isDragging = false;
		let startY, startValue;

		this.input.addEventListener( 'mousedown', ( e ) => {

			isDragging = true;
			startY = e.clientY;
			startValue = parseFloat( this.input.value );
			document.body.style.cursor = 'ns-resize';

		} );

		document.addEventListener( 'mousemove', ( e ) => {

			if ( isDragging ) {

				const deltaY = startY - e.clientY;
				const step = parseFloat( this.input.step ) || 1;
				const min = parseFloat( this.input.min );
				const max = parseFloat( this.input.max );

				let stepSize = step;
				// @reviser lijuhong stepSize计算有问题，注释掉该代码
				// if ( !isNaN( max ) && isFinite( min ) ) {

				// 	stepSize = ( max - min ) / 100;

				// }

				const change = deltaY * stepSize;

				let newValue = startValue + change;
				newValue = Math.max( min, Math.min( newValue, max ) );
				// @reviser lijuhong 注释该行代码，将precision计算放到step方法中进行

				// const precision = ( String( step ).split( '.' )[ 1 ] || [] ).length;
				this.input.value = newValue.toFixed( this.precision ); // @reviser lijuhong 直接引用precision属性

				this.input.dispatchEvent( new Event( 'input' ) );

				this.dispatchChange();

			}

		} );

		document.addEventListener( 'mouseup', () => {

			if ( isDragging ) {

				isDragging = false;
				document.body.style.cursor = 'default';

			}

		} );

	}

	setValue( val ) {
		// @reviser lijuhong 根据精度设置输入框的value
		this.input.value = val.toFixed( this.precision );

		return super.setValue( val );

	}

	getValue() {

		return parseFloat( this.input.value );

	}

	// @reviser lijuhong 添加 min、max、step方法，方便链式调用设置数值范围和步长
	min( value = -Infinity ) {
		this.input.min = value;
		return this;
	}
	max( value = Infinity ) {
		this.input.max = value;
		return this;
	}
	step( value = 0.1 ) {
		this.input.step = value;
		this.precision = (String(value).split('.')[1] || []).length;
		return this;
	}

}

class ValueCheckbox extends Value {

	constructor( { value = false } ) {

		super();

		const label = document.createElement( 'label' );
		label.className = 'custom-checkbox';

		const checkbox = document.createElement( 'input' );
		checkbox.type = 'checkbox';
		checkbox.checked = value;
		this.checkbox = checkbox;

		const checkmark = document.createElement( 'span' );
		checkmark.className = 'checkmark';

		label.appendChild( checkbox );
		label.appendChild( checkmark );
		this.domElement.appendChild( label );

		checkbox.addEventListener( 'change', () => {

			this.dispatchChange();

		} );

	}

	setValue( val ) {

		this.checkbox.checked = val;

		return super.setValue( val );

	}

	getValue() {

		return this.checkbox.checked;

	}

}

class ValueSlider extends Value {

	constructor( { value = 0, min = 0, max = 1, step = 0.01 } ) {

		super();

		this.slider = document.createElement( 'input' );
		this.slider.type = 'range';
		this.slider.min = min;
		this.slider.max = max;
		// this.slider.step = step; // @reviser lijuhong 注释该行代码，后面调用step方法设置step值

		const numberValue = new ValueNumber( { value, min, max, step } );
		// @reviser lijuhong 添加numberValue属性
		this.numberValue = numberValue;
		this.numberInput = numberValue.input;
		this.numberInput.style.flexBasis = '80px';
		this.numberInput.style.flexShrink = '0';

		// this.slider.value = value; // @reviser lijuhong 注释该行代码，后面调用setValue方法设置value值
		// @reviser lijuhong 链式设置step、value值
		this.step( step ).setValue( value );

		this.domElement.append( this.slider, this.numberInput );

		this.slider.addEventListener( 'input', () => {

			this.numberInput.value = this.slider.value;

			this.dispatchChange();

		} );

		numberValue.addEventListener( 'change', () => {

			this.slider.value = parseFloat( this.numberInput.value );

			this.dispatchChange();

		} );

	}

	setValue( val ) {
		// @reviser lijuhong 根据精度设置输入框的value
		val = val.toFixed( this.precision );
		this.slider.value = val;
		this.numberInput.value = val;

		return super.setValue( val );

	}

	getValue() {

		return parseFloat( this.slider.value );

	}

	step( value ) {
		// @reviser lijuhong 调用numberValue.step方法设置step值
		this.numberValue.step( value );
		this.slider.step = value;
		// this.numberInput.step = value;

		return this;

	}
	// @reviser lijuhong 添加precision属性，获取数值精度
	get precision() {
		return this.numberValue.precision;
	}
	// @reviser lijuhong 添加min、max方法，方便链式调用设置数值范围和步长
	min( value = -Infinity ) {
		this.slider.min = value;
		this.numberInput.min = value;
		return this;
	}
	max( value = Infinity ) {
		this.slider.max = value;
		this.numberInput.max = value;
		return this;
	}

}

class ValueSelect extends Value {

	constructor( { options = [], value = '' } ) {

		super();

		const select = document.createElement( 'select' );

		const createOption = ( name, optionValue ) => {

			const optionEl = document.createElement( 'option' );
			optionEl.value = name;
			optionEl.textContent = name;

			if ( optionValue == value ) optionEl.selected = true;

			select.appendChild( optionEl );

			return optionEl;

		};

		if ( Array.isArray( options ) ) {

			options.forEach( opt => createOption( opt, opt ) );

		} else {

			Object.entries( options ).forEach( ( [ key, value ] ) => createOption( key, value ) );

		}

		this.domElement.appendChild( select );

		//

		select.addEventListener( 'change', () => {

			this.dispatchChange();

		} );

		this.options = options;
		this.select = select;

	}

	getValue() {

		const options = this.options;

		if ( Array.isArray( options ) ) {

			return options[ this.select.selectedIndex ];

		} else {

			return options[ this.select.value ];

		}

	}

}

class ValueColor extends Value {

	constructor( { value = '#ffffff' } ) {

		super();

		const colorInput = document.createElement( 'input' );
		colorInput.type = 'color';
		colorInput.value = this._getColorHex( value );
		this.colorInput = colorInput;

		this._value = value;

		colorInput.addEventListener( 'input', () => {

			const colorValue = colorInput.value;

			if ( this._value.isColor ) {

				this._value.setHex( parseInt( colorValue.slice( 1 ), 16 ) );

			} else {

				this._value = colorValue;

			}

			this.dispatchChange();

		} );

		this.domElement.appendChild( colorInput );

	}

	_getColorHex( color ) {

		if ( color.isColor ) {

			color = color.getHex();

		}

		if ( typeof color === 'number' ) {

			color = `#${ color.toString( 16 ) }`;

		} else if ( color[ 0 ] !== '#' ) {

			color = '#' + color;

		}

		return color;

	}

	getValue() {

		let value = this._value;

		if ( typeof value === 'string' ) {

			value = parseInt( value.slice( 1 ), 16 );

		}

		return value;

	}

}

class ValueButton extends Value {

	constructor( { text = 'Button', value = () => {} } ) {

		super();

		const button = document.createElement( 'button' );
		button.textContent = text;
		button.onclick = value;
		this.domElement.appendChild( button );

	}

}

class ValueString extends Value {

	constructor( { value = '' } ) {

		super();

		const input = document.createElement( 'input' );
		input.type = 'text';
		input.value = value;
		this.input = input;

		input.addEventListener( 'input', () => {

			this.dispatchChange();

		} );

		this.domElement.appendChild( input );

	}

	setValue( val ) {

		this.input.value = val;

		return super.setValue( val );

	}

	getValue() {

		return this.input.value;

	}

}

export { Value, ValueNumber, ValueString, ValueCheckbox, ValueSlider, ValueSelect, ValueColor, ValueButton };
