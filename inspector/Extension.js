import { Tab } from './ui/Tab.js'; // @reviser lijuhong 修改引用路径

export class Extension extends Tab {

	constructor( name, options = {} ) {

		super( name, options );

		this.isExtension = true;

	}

}
