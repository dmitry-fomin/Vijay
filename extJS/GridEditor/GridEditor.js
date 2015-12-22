Ext.define('GridEditable.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.grideditable',

    requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Text',
        'Ext.toolbar.TextItem'
    ],

    initComponent: function()
    {
        this.editing = Ext.create('Ext.grid.plugin.CellEditing');
		this.filters = {
	        ftype: 'filters',
	        // encode and local configuration options defined previously for easier reuse
	        encode: false, // json encode the filter query
	        local: true,   // defaults to false (remote filtering)
	
	        // Filters are most naturally placed in the column definition, but can also be
	        // added here.
	        filters: [{
	            type: 'boolean',
	            dataIndex: 'visible'
	        }]
	    };
		Ext.apply(this, {
            plugins: [this.editing],
            features: [this.filters],
            dockedItems: [
	            {
	                xtype: 'toolbar',
	                items: [
		                {
							text: 'Add',
							scope: this,
							handler: this.onAddClick
		                },
		                {
							text: 'Delete',
							scope: this,
							handler: this.onDeleteClick
		                },
		                '->',
		                {
							text: 'Save',
							scope: this,
							handler: this.onSync
		                },
	                ]
				},
				{
	                xtype: 'toolbar',
	                dock: 'bottom',
	                items: [
		                {
						    text: 'Clear Filter Data',
							scope: this,
						    handler: function () {
						        this.filters.clearFilters();
						    }

						}
					]
				}
			]
        });
        this.callParent();
    },
    onSync: function()
    {
        this.getStore().sync(
        {
			success : function(){},
			failure : function(b, options)
			{
				Ext.each(b.exceptions, function(operation) {
		            if (operation.hasException()) {
		                Ext.Msg.alert('Error', operation.error);
		            }
		        });
			}  
		});
    },
    onDeleteClick: function(){
        var selection = this.getView().getSelectionModel().getSelection()[0];
        if (selection) {
            this.getStore().remove(selection);
        }
    },
	onAddClick : function()
	{
        var edit = this.editing;
        edit.cancelEdit();
        var index = this.store.getCount();
        this.store.insert(index, {});
        edit.startEditByPosition({
            row: index,
            column: 0
        });
	}
});

Ext.define('GridCreator.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.gridcreator',

    requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Text',
        'Ext.toolbar.TextItem'
    ],

    initComponent: function()
    {
        this.editing = Ext.create('Ext.grid.plugin.CellEditing');
		this.store = Ext.create('Ext.data.Store', {
		    fields:['id', 'name', 'type' ],
		    data:
		    {
			    items:
			    [
		        	{ 'id': 'id',  "name":"Identificator", 'type' : 'textfield' }
		        ]
			},
		    proxy: {
		        type: 'memory',
		        reader: {
		            type: 'json',
		            root: 'items'
		        }
		    }
		});
		this.GridName = Ext.create('Ext.form.field.Text', 
		{
			allowBlank : false
		});

		Ext.apply(this, {
            plugins: [this.editing],
			columns: [
		        {
			        text: 'ID',
			        dataIndex: 'id',
			        flex : 1,
					field: {
						type: 'textfield'
					}
				},
		        {
			        text: 'Name',
			        dataIndex: 'name',
			        flex : 1,
					field: {
						type: 'textfield'
					}
				},
				{
					header: 'Type',
					dataIndex: 'type',
					field: {
						xtype: 'combo',
		                editable : false,
		                allowBlank : false,
		                valueField : 'value',
		                displayField: 'display',
		                queryMode: 'local',
		                store:  Ext.create('Ext.data.Store',
		                {
							fields: ['value', 'display'],
							data : [
								{ value: 'textfield',   display: 'textfield' },
								{ value: 'numberfield',   display: 'numberfield' }
							]
						}),
		                listClass: 'x-combo-list-small'
					}
				}
		    ],
            store : this.store,
            dockedItems: [
	            {
	                xtype: 'toolbar',
	                items: [
	                {
	                    text: 'Add new column in future grid',
	                    scope: this,
	                    handler: this.onAddClick
	                }
	                ]
				},
	            {
	                xtype: 'toolbar',
	                dock: 'bottom',
	                items: [
			            '->',
			            this.GridName,
			            {
			                text: 'Create table',
			                scope: this,
			                handler: this.onCreateGrid
			            }
	                ]
				}
			]
        });
        this.callParent();
    },
	onAddClick : function()
	{
        var edit = this.editing;
        edit.cancelEdit();
        var index = this.store.getCount();
        this.store.insert(index, {});
        edit.startEditByPosition({
            row: index,
            column: 0
        });
	},
	onCreateGrid : function()
	{
		this.tabContaner.add( this.GridConstructor() );
	},
	GridConstructor : function( )
	{
		var fields = [];
		var columns = [];
		
		this.getStore().each(function(record)
		{  
			fields.push(record.get('id'));
			columns.push(
				{
			        text: record.get('name'),
			        dataIndex: record.get('id'),
			        filterable: true,
			        flex : 1,
					field: {
						type: record.get('type')
					}
				}
			)
		},this);
		
		var store = Ext.create('Ext.data.Store', {
		    fields : fields,
		    remoteSort: false,
			proxy: {
		    	type: 'ajax',
	            api : {
	            	create : 'items.phpaction=create',
	            	read : 'items.php',
	            	update : 'items.phpaction=update',
	            	destroy : 'items.phpaction=delete'
	            },
	            reader: {
	                type : 'json',
	                rootProperty: 'items',
	                successProperty: 'success',
	                messageProperty : 'message',
	                totalProperty: 'total'
	            },
				writer: {
	                type: 'json',
	                clientIdProperty: 'id',
	                rootProperty: 'items',
	                writeAllFields: true
	            }
			},
			autoLoad: true
		});
		
		var grid = Ext.create('GridEditable.Grid',
		{
		    title : this.GridName.getValue() || 'No name',
		    store: store,
		    columns: columns
		});
		
		return grid;
	}
});

Ext.define('GridEditor.App', {
    extend: 'Ext.container.Viewport',
    
    initComponent: function()
    {
        var tabPanel = this.createTabPanel();
        
        Ext.apply(this, {
            layout: 'border',
            padding: 5,
            items: [
            	{
					xtype : 'toolbar',
					region: 'north',
			        dock: 'top',
			        split : false,
			        margins: '0 0 5 0',
			        items: 
			        [
						{
							text: 'New grid',
							handler : function()
							{
								//console.log(tabPanel);
							    
							    this.CreateDialog = Ext.create('Ext.Window',
							    {
									width : 300,
									height: 200,
									title: 'Create new grid',
									maximizable : true,
									layout : 'fit',
									items: [
										{
											xtype : 'gridcreator',
											border : false,
											tabContaner : tabPanel
										}
									]
							    }).show();
							}
						}
			        ]
		        },
		        this.tabPanel
			]
        });

        /* mask remove */
        Ext.get('loading').remove();
        Ext.fly('loading-mask').animate({
            opacity:0,
            remove:true
        });

        this.callParent(arguments);
    },
    
    /**
     * Create the list of fields to be shown on the left
     * @private
     * @return {GridViewer.tabPanel} tabPanel
     */
    createTabPanel: function(){
        this.tabPanel = Ext.create('widget.tabpanel', {
            region: 'center',
            floatable: false,
            minWidth: 1000,
            items : [],
            listeners: { scope: this }
        });
        return this.tabPanel;
    }
});
