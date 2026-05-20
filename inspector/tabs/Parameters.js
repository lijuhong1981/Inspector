import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { createValueSpan } from '../ui/utils.js';
import { ValueString, ValueNumber, ValueSlider, ValueSelect, ValueCheckbox, ValueColor, ValueButton } from '../ui/Values.js';

class ParametersGroup {

	constructor( parameters, name ) {

		this.parameters = parameters;
		this.name = name;

		this.paramList = new Item( name );

		this.objects = [];

	}

	close() {

		this.paramList.close();

		return this;

	}
	// @reviser lijuhong 新增open方法
	open() {

		this.paramList.open();

		return this;

	}

	add( object, property, ...params ) {

		const value = object[ property ];
		const type = typeof value;

		let item = null;

		if ( typeof params[ 0 ] === 'object' ) {

			item = this.addSelect( object, property, params[ 0 ] );

		} else if ( type === 'number' ) {
			// @reviser lijuhong 添加对params[0, 1]元素不为undefined的判断
			if ( params.length >= 2 && params[0] !== undefined && params[1] !== undefined ) {

				item = this.addSlider( object, property, ...params );

			} else {

				item = this.addNumber( object, property, ...params );

			}

		} else if ( type === 'boolean' ) {

			item = this.addBoolean( object, property );

		} else if ( type === 'string' ) {

			item = this.addString( object, property );

		} else if ( type === 'function' ) {

			item = this.addButton( object, property, ...params );

		}

		return item;

	}
	// @reviser lijuhong 新增remove方法，用于移除使用add方法添加的
	remove( editor ) {

		const index = this.objects.findIndex( ( element ) => element.editor === editor );

		if ( index !== - 1 ) {

			const { subItem } = this.objects[ index ];
			this.paramList.remove( subItem );
			this.objects.splice( index, 1 );

		}

	}

	_addParameter( object, property, editor, subItem ) {

		editor.name = ( name ) => {

			subItem.data[ 0 ].textContent = name;

			return editor;

		};

		editor.listen = () => {

			const update = () => {

				const value = editor.getValue();
				let propertyValue = object[ property ];
				// @reviser lijuhong 添加对数值类型属性的精度处理
				if ( typeof editor.precision === 'number' && typeof propertyValue === 'number' ) {
					propertyValue = parseFloat(propertyValue.toFixed( editor.precision ));
				}

				if ( value !== propertyValue ) {

					editor.setValue( propertyValue );

				}

				requestAnimationFrame( update );

			};

			requestAnimationFrame( update );

			return editor;

		};

		this._registerParameter( object, property, editor, subItem );

	}

	_registerParameter( object, property, editor, subItem ) {

		this.objects.push( { object: object, key: property, editor: editor, subItem: subItem } );
		// @reviser lijuhong 新增remove方法，调用后将从该Group下移除自身
		editor.remove = () => {

			this.remove(editor);

			return editor;
		};

	}

	addString( object, property ) {

		const value = object[ property ];

		const editor = new ValueString( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addFolder( name ) {

		const group = new ParametersGroup( this.parameters, name );

		this.paramList.add( group.paramList );

		return group;

	}
	// @reviser lijuhong 新增removeFolder方法
	removeFolder( group ) {

		if ( group && group.paramList ) {

			this.paramList.remove( group.paramList );

		}

		return this;

	}

	addBoolean( object, property ) {

		const value = object[ property ];

		const editor = new ValueCheckbox( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		// extends logic to toggle checkbox when clicking on the row

		const itemRow = subItem.domElement.firstChild;

		itemRow.classList.add( 'actionable' );
		itemRow.addEventListener( 'click', ( e ) => {

			if ( e.target.closest( 'label' ) ) return;

			const checkbox = itemRow.querySelector( 'input[type="checkbox"]' );

			if ( checkbox ) {

				checkbox.checked = ! checkbox.checked;
				checkbox.dispatchEvent( new Event( 'change' ) );

			}

		} );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addSelect( object, property, options ) {

		const value = object[ property ];

		const editor = new ValueSelect( { options, value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addColor( object, property ) {

		const value = object[ property ];

		const editor = new ValueColor( { value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addSlider( object, property, min = 0, max = 1, step = 0.01 ) {

		const value = object[ property ];

		const editor = new ValueSlider( { value, min, max, step } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addNumber( object, property, ...params ) {

		const value = object[ property ];
		// @reviser lijuhong 添加step参数
		const [ min, max, step ] = params;
		// @reviser lijuhong 添加step参数
		const editor = new ValueNumber( { value, min, max, step } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const description = createValueSpan();
		description.textContent = property;

		const subItem = new Item( description, editor.domElement );
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		this._addParameter( object, property, editor, subItem );

		return editor;

	}

	addButton( object, property ) {
		// @reviser lijuhong 添加bind，确保函数内的this指向正确
		const value = object[ property ].bind( object );

		const editor = new ValueButton( { text: property, value } );
		editor.addEventListener( 'change', ( { value } ) => {

			object[ property ] = value;

		} );

		const subItem = new Item( editor.domElement );
		subItem.itemRow.childNodes[ 0 ].style.gridColumn = '1 / -1';
		this.paramList.add( subItem );

		const itemRow = subItem.domElement.firstChild;
		itemRow.classList.add( 'actionable' );

		// extend object property

		editor.name = ( name ) => {

			editor.domElement.childNodes[ 0 ].textContent = name;

			return editor;

		};

		this._registerParameter( object, property, editor, subItem );

		return editor;

	}

}

class Parameters extends Tab {

	constructor( options = {} ) {

		super( options.name || 'Parameters', options );

		const paramList = new List( 'Property', 'Value' );
		paramList.domElement.classList.add( 'parameters' );
		paramList.setGridStyle( '.5fr 1fr' );
		paramList.domElement.style.minWidth = '300px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( paramList.domElement );
		this.content.appendChild( scrollWrapper );

		this.paramList = paramList;

		this.groups = [];

	}

	createGroup( name ) {

		const group = new ParametersGroup( this, name );

		this.paramList.add( group.paramList );
		this.groups.push( group );

		return group;

	}

}

export { Parameters };
