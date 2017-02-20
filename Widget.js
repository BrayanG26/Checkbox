app = {};
define([
		'dojo/_base/declare',
		'jimu/BaseWidget',
		'dojo/_base/lang',
		"dojo/store/Memory",
		'dijit/form/Select',
		'dijit/form/CheckBox',
		'dojo/dom-style',
		'dojo/_base/fx',
		'dojo/_base/lang',
		'dojo/on',
		'dojo/_base/array',
		'esri/tasks/IdentifyTask',
		'esri/tasks/IdentifyParameters',
		'esri/request',
		'esri/InfoTemplate',
		'esri/symbols/SimpleMarkerSymbol',
		'esri/symbols/PictureMarkerSymbol',
		'esri/Color',
		'esri/graphic',
		'dojo/dom',
		'dijit/registry'],
	function (declare,
		BaseWidget,
		lang,
		Memory,
		Select,
		CheckBox,
		domStyle,
		basefx,
		lang,
		on,
		array,
		IdentifyTask,
		IdentifyParameters,
		esriRequest,
		InfoTemplate,
		SimpleMarkerSymbol,
		PictureMarkerSymbol,
		Color,
		Graphic,
		dom,
		registry) {
	//To create a widget, you need to derive from BaseWidget.
	return declare([BaseWidget], {
		// DemoWidget code goes here

		//please note that this property is be set by the framework when widget is loaded.
		//templateString: template,

		baseClass: 'jimu-widget-checkbox',
		clickHandler: null,
		checkbox: null,

		postCreate: function () {
			this.inherited(arguments);
			//console.log('postCreate');
		},

		startup: function () {
			this.inherited(arguments);
			this.checkbox = new CheckBox({
					id: "checkBox",
					name: "checkBox",
					value: "false",
					style: 'left:5px',
					checked: false,
					onChange: lang.hitch(this, this.checkedFunction)
				}, "checkBox");
			this.checkbox.startup();
			app.map = this.map;
			var chkbox = registry.byId("checkBox");
			for (var i = 0; i < this.map.layerIds.length; i++) {
				var id = this.map.layerIds[i];
				if (id.match(/vectorial/i)) {
					var vectorial = this.map.getLayer(id);
				}
			}
			if(vectorial.opacity > 0.1){
				chkbox.setAttribute('disabled', true);
			}
			vectorial.on('opacity-change', lang.hitch(this, function (opacityObj) {
					//enable or disable checkBox depending satellital layer opacity
					var state = this.checkbox.get('checked');
					
					if (opacityObj.opacity < 0.1) {
						chkbox.setAttribute('disabled', false);
					}else{
						chkbox.setAttribute('disabled', true);
						if(state){
							this.checkbox.set('checked', false);
						}
					}
				}));
		},

		onOpen: function () {
			console.log('onOpen');
		},

		onClose: function () {
			console.log('onClose');
		},
		checkedFunction: function (checked) {
			var color = domStyle.get('container', 'backgroundColor');
			var newcolor;
			if (color == 'rgba(207, 215, 204, 0.6)') {
				basefx.animateProperty({
					node: "container",
					duration: 450,
					properties: {
						color: {
							start: '#333333',
							end: 'white'
						}
					},
				}).play();
				domStyle.set('container', {
					backgroundColor: "rgba(106, 110, 104, 0.7)"
				});

			} else {
				var bheight,
				bwidth;
				bheight = '19px';
				bwidth = '156px';
				domStyle.set('container', {
					width: bwidth,
					height: bheight,
					backgroundColor: "rgba(207, 215, 204, 0.6)"
				});
				basefx.animateProperty({
					node: "container",
					duration: 700,
					properties: {
						color: {
							start: 'white',
							end: '#333333'
						}
					},
				}).play();
			}
			dom.byId('info').innerHTML = '';
			console.warn('onChange called with parameter = ' + checked);
			this.bindEvents(checked);
		},
		bindEvents: function (checked) {
			console.info('checkBox checked');
			if (!checked) {
				this.clickHandler.remove();
			} else {
				this.clickHandler = this.map.on('click', lang.hitch(this, this.executeIdentifyTask));
			}
		},
		activateCheckbox: function () {
			console.log(this.checkbox);
			console.log(this.checkbox.get('checked'));
			this.checkbox.set('checked', true);
			console.log(this.checkbox.get('checked'));
		},
		executeIdentifyTask: function (event) {
			var feature;
			console.info('executeIdentifyTask');
			app.map = this.map;
			var idLayer;
			array.forEach(this.map.layerIds, function (id) {
				if (id.match(/satelital/i)) {
					idLayer = id;
				}
			});
			var layer = this.map.getLayer(idLayer);
			app.url = layer.url;
			identifyTask = new IdentifyTask(layer.url);
			identifyParams = new IdentifyParameters();
			identifyParams.tolerance = 3;
			identifyParams.layerIds = [10,11,12,13,14,15,16];
			identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;

			identifyParams.geometry = event.mapPoint;
			identifyParams.mapExtent = this.map.extent;
			identifyTask.execute(identifyParams, function (response) {
				console.info(response);
				var url = app.url + '/' + response[0].layerId;
				console.info(url);
				var request = esriRequest({
						url: url,
						content: {
							f: 'json'
						},
						callbackParamName: 'callback'
					});
				request.then(function (response, io) {
					var info = response.description;
					var width;
					var reference = 'Fecha imagen satelital';
					if (info.length >= reference.length) {
						width = (info.length * 10 + 15) + 'px';
					}
					domStyle.set('container', {
						width: width,
						height: '33px'
					});

					dom.byId('info').innerHTML = info;
					basefx.animateProperty({
						node: "info",
						duration: 1200,
						properties: {
							color: {
								start: '#93bdd9',
								end: 'white'
							}
						},
					}).play();
				}, function (err) {
					console.log('error ocurred: ' + err);
				});
			});

		}
	});
});