'use strict';

const assert = require('assert');
const requirejs = require('requirejs');

// Ensure define is available in Node.js
global.define = global.define || function (name, deps, factory) {
	// Create the module manually if not already defined
	if (!global[name]) {
		global[name] = factory();
	}
};

// Configure requirejs for Node.js
requirejs.config({
	nodeRequire: require,
});

// Load the widgets module using requirejs
describe('Widgets Utility Tests', () => {
	let Widgets;

	before((done) => {
		// Use requirejs to load the module
		requirejs(['../public/src/admin/extend/widgets'], (widgetModule) => {
			Widgets = widgetModule;
			done();
		});
	});

	describe('Widget Rendering', () => {
		it('should render a widget with default parameters', () => {
			const widget = Widgets.renderWidget({});
			assert(widget.includes('<div'), 'Widget does not contain a valid HTML structure');
			assert(widget.includes('default-class'), 'Widget does not include default class');
		});

		it('should render a widget with provided parameters', () => {
			const widget = Widgets.renderWidget({ id: 'widget1', class: 'custom-class' });
			assert(widget.includes('id="widget1"'), 'Widget does not contain the correct id');
			assert(widget.includes('custom-class'), 'Widget does not contain the correct class');
		});
	});

	describe('Widget Validation', () => {
		it('should validate a correctly configured widget', () => {
			const isValid = Widgets.validateWidget({ id: 'validWidget', type: 'chart' });
			assert.strictEqual(isValid, true, 'Widget validation failed for valid input');
		});

		it('should invalidate a widget with missing required properties', () => {
			const isValid = Widgets.validateWidget({ type: 'chart' });
			assert.strictEqual(isValid, false, 'Widget validation passed for missing properties');
		});

		it('should invalidate a widget with unsupported type', () => {
			const isValid = Widgets.validateWidget({ id: 'invalidWidget', type: 'unknown' });
			assert.strictEqual(isValid, false, 'Widget validation passed for unsupported type');
		});
	});

	describe('Widget ID Generation', () => {
		it('should generate unique IDs', () => {
			const id1 = Widgets.generateWidgetID();
			const id2 = Widgets.generateWidgetID();
			assert.notStrictEqual(id1, id2, 'Generated IDs are not unique');
		});

		it('should generate IDs with the correct prefix', () => {
			const id = Widgets.generateWidgetID('prefix');
			assert(id.startsWith('prefix'), 'Generated ID does not have the correct prefix');
		});
	});

	describe('Widget State Management', () => {
		it('should correctly save and retrieve widget state', () => {
			const widgetState = { id: 'widget1', state: { data: [1, 2, 3] } };
			Widgets.saveState(widgetState);
			const savedState = Widgets.getState('widget1');
			assert.deepStrictEqual(savedState, { data: [1, 2, 3] }, 'Widget state was not saved correctly');
		});

		it('should return undefined for a non-existent widget state', () => {
			const state = Widgets.getState('nonExistentWidget');
			assert.strictEqual(state, undefined, 'Non-existent widget state should return undefined');
		});
	});

	describe('Widget Data Parsing', () => {
		it('should correctly parse valid widget data', () => {
			const rawData = '{"id":"widget1","data":[1,2,3]}';
			const parsedData = Widgets.parseWidgetData(rawData);
			assert.deepStrictEqual(parsedData, { id: 'widget1', data: [1, 2, 3] }, 'Widget data was not parsed correctly');
		});

		it('should throw an error for invalid JSON data', () => {
			const rawData = '{"id":"widget1","data":}'; // Malformed JSON
			assert.throws(() => Widgets.parseWidgetData(rawData), SyntaxError, 'Invalid JSON data did not throw an error');
		});
	});

	describe('Widget Configuration', () => {
		it('should merge default and custom configurations correctly', () => {
			const defaultConfig = { theme: 'light', layout: 'grid' };
			const customConfig = { layout: 'list', color: 'blue' };
			const mergedConfig = Widgets.mergeConfigurations(defaultConfig, customConfig);
			assert.deepStrictEqual(mergedConfig, { theme: 'light', layout: 'list', color: 'blue' }, 'Configurations were not merged correctly');
		});

		it('should return default configuration when custom configuration is empty', () => {
			const defaultConfig = { theme: 'light', layout: 'grid' };
			const customConfig = {};
			const mergedConfig = Widgets.mergeConfigurations(defaultConfig, customConfig);
			assert.deepStrictEqual(mergedConfig, defaultConfig, 'Default configuration was not returned correctly');
		});
	});
});
