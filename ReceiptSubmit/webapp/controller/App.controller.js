sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/ui/comp/filterbar/FilterGroupItem",
	"sap/m/Input",
	"sap/m/MultiInput",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, ValueHelpDialog, mTable, Text, Filter, FilterOperator, FilterBar, FilterGroupItem,
	Input, MultiInput, MessageToast, Token, UploadCollectionParameter, Sorter) {
	"use strict";

	return BaseController.extend("ReceiptSubmit.controller.App", {

		onInit: function () {},

		formatDate: function (value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},
		getMediaUrl: function (sUrl) {
			if (sUrl) {
				var url = new URL(sUrl);
				var start = url.href.indexOf(url.origin);
				// var sPath = url.href.substring(start, start + url.origin.length);
				var sPath = url.href.substring(start + url.origin.length, url.href.length);
				return sPath.replace("/sap/opu/odata/sap", "/html5apps/receiptwf/destinations/WT_S4HC");

			} else {
				return "";
			}
		},
		onSearchBankAccount: function (oEvent) {
			var that = this;
			//设置语言
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			if (!this._oMTableBKA) {
				var oSRColumnModel = new JSONModel();
				oSRColumnModel.setData({
					cols: [{
						label: "科目",
						template: "GLAccount"
					}, {
						label: "科目描述",
						template: "GLAccountName"
					}, {
						label: "公司代码",
						template: "CompanyCode"
					}]
				});
				this._oMTableBKA = new mTable();
				this._oMTableBKA.setModel(oSRColumnModel, "columns");
				// oMTable.setBusy(true);
				this._oMTableBKA.setModel(this.getModel("BANKGLACCOUNTVH"), "BANKGLACCOUNTVH");
				this._oMTableBKA.getModel("BANKGLACCOUNTVH").attachBatchRequestCompleted(function (oEvent) {
					that._oValueHelpDialogBKA.setContentHeight("100%");
				});
			}
			if (!this._oFilterBarBKA) {
				if (!this._GLAccountInput) {
					this._GLAccountInput = new Input({
						id: "GLAccount"
					});
				}

				if (!this._GLAccountNameInput) {
					this._GLAccountNameInput = new Input({
						id: "GLAccountName"
					});
				}

				this._oFilterBarBKA = new FilterBar({
					advancedMode: true,
					filterBarExpanded: true, //Device.system.phone,
					//showGoOnFB: !Device.system.phone,
					filterGroupItems: [new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "GLAccount",
							label: "會計科目",
							control: this._GLAccountInput,
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "GLAccountName",
							label: "科目描述",
							control: this._GLAccountNameInput,
							visibleInFilterBar: true
						})
					],
					search: function (oEvent) {
						var aSearchItems = oEvent.getParameters().selectionSet;
						var aFilters = [];
						for (var i = 0; i < aSearchItems.length; i++) {
							// sMsg += "/" + aSearchItems[i].getValue();
							if (aSearchItems[i].getValue() != "") {
								var filter = new Filter({
									path: aSearchItems[i].getId(),
									operator: FilterOperator.Contains,
									value1: aSearchItems[i].getValue()
								});
								aFilters.push(filter);
							}

						}
						var aFiltersLast = [new Filter({
								path: "Language",
								operator: FilterOperator.EQ,
								value1: sLanguage
							}),
							new Filter({
								path: "CompanyCode",
								operator: FilterOperator.EQ,
								value1: that.getModel("data").getProperty("/context/COMPANYCODE")
							})
						];
						if (aFilters.length > 0) {
							aFiltersLast.push(new Filter({
								filters: aFilters,
								and: false
							}));
						}

						that._oMTableBKA.bindItems({
							path: "BANKGLACCOUNTVH>/YY1_BANKGLACCOUNTVH",
							template: new sap.m.ColumnListItem({
								cells: [
									new Text({
										text: "{BANKGLACCOUNTVH>GLAccount}"
									}),
									new Text({
										text: "{BANKGLACCOUNTVH>GLAccountName}"
									}),
									new Text({
										text: "{BANKGLACCOUNTVH>CompanyCode}"
									})
								]
							}),
							filters: aFiltersLast
						});

					},
					clear: function (oEvent) {

					}
				});
			}

			if (!this._oValueHelpDialogBKA) {
				this._oValueHelpDialogBKA = new ValueHelpDialog("idValueHelpBKA", {
					supportRanges: false,
					supportMultiselect: false,
					// filterMode: true,
					key: "GLAccount",
					descriptionKey: "GLAccount",
					title: "银行科目搜索",
					ok: function (oEvent) {

						this.close();
					},
					cancel: function () {
						this.close();
					},
					selectionChange: function (oEvent) {
						var sPath = oEvent.getParameter("tableSelectionParams").listItem.getBindingContextPath();
						// var sItemPath_G = that.getModel().getProperty("/valueHelpItemPath");
						// that.getModel().setProperty(sItemPath_G + "/Material", that.getModel("Product").getProperty(sPath).Product);
						// that.getModel().setProperty(sItemPath_G + "/MaterialDescription", that.getModel("Product").getProperty(sPath).ProductDescription);
						// that.getModel().setProperty(sItemPath + "/Material",that.gt)
						that.getModel("data").setProperty("/context/BANKACCOUNT", that.getModel("BANKGLACCOUNTVH").getProperty(sPath).GLAccount);
						that.getModel("data").setProperty("/context/BANKACCOUNTDES", that.getModel("BANKGLACCOUNTVH").getProperty(
							sPath).GLAccountName);
					}
				});
				this._oValueHelpDialogBKA.setTable(this._oMTableBKA);
				this._oValueHelpDialogBKA.setFilterBar(this._oFilterBarBKA);
			}

			this._oValueHelpDialogBKA.open();

		},
		onSearchCustomer: function (oEvent) {
			var that = this;
			//设置语言
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			if (!this._oMTableC) {
				var oSRColumnModel = new JSONModel();
				oSRColumnModel.setData({
					cols: [{
						label: "客户编码",
						template: "BusinessPartner"
					}, {
						label: "客户描述",
						template: "BusinessPartnerName"
					}, {
						label: "客户简称",
						template: "SearchTerm1"
					}]
				});
				this._oMTableC = new mTable();
				this._oMTableC.setModel(oSRColumnModel, "columns");
				this._oMTableC.setModel(this.getModel("CUSTOMERVH"), "CUSTOMERVH");
				this._oMTableC.getModel("CUSTOMERVH").attachBatchRequestCompleted(function (oEvent) {
					that._oValueHelpDialogC.setContentHeight("100%");
				});
			}
			if (!this._oFilterBarC) {
				this._oFilterBarC = new FilterBar({
					advancedMode: true,
					filterBarExpanded: true, //Device.system.phone,
					//showGoOnFB: !Device.system.phone,
					filterGroupItems: [new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "Customer",
							label: "客户编码",
							control: new Input({
								id: "Customer"
							}),
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "CustomerName",
							label: "客户描述",
							control: new Input({
								id: "CustomerName"
							}),
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "SearchTerm1",
							label: "客户简称",
							control: new Input({
								id: "SearchTerm1"
							}),
							visibleInFilterBar: true
						})
					],
					search: function (oEvent) {
						var aSearchItems = oEvent.getParameters().selectionSet;
						var aFilters = [];
						for (var i = 0; i < aSearchItems.length; i++) {
							// sMsg += "/" + aSearchItems[i].getValue();
							if (aSearchItems[i].getValue() != "") {
								var filter = new Filter({
									path: aSearchItems[i].getId(),
									operator: FilterOperator.Contains,
									value1: aSearchItems[i].getValue()
								});
								aFilters.push(filter);
							}

						}
						var aFiltersLast = [
							// new Filter({
							// 	path: "Language",
							// 	operator: FilterOperator.EQ,
							// 	value1: "" //sLanguage
							// }),
							new Filter({
								path: "CompanyCode",
								operator: FilterOperator.EQ,
								value1: that.getModel("data").getProperty("/context/COMPANYCODE")
							})
						];
						if (aFilters.length > 0) {
							aFiltersLast.push(new Filter({
								filters: aFilters,
								and: false
							}));
						}

						that._oMTableC.bindItems({
							path: "CUSTOMERVH>/YY1_CUMTOMERVH",
							template: new sap.m.ColumnListItem({
								// type: "Navigation",
								cells: [
									new Text({
										text: "{CUSTOMERVH>Customer}"
									}),
									new Text({
										text: "{CUSTOMERVH>CustomerName}"
									}),
									new Text({
										text: "{CUSTOMERVH>SearchTerm1}"
									})
								]
							}),
							filters: aFiltersLast
						});

					},
					clear: function (oEvent) {

					}
				});
			}

			if (!this._oValueHelpDialogC) {
				this._oValueHelpDialogC = new ValueHelpDialog("idValueHelpC", {
					supportRanges: false,
					supportMultiselect: false,
					// filterMode: true,
					key: "CUSTOMER",
					descriptionKey: "CUSTOMER",
					title: "客户",
					ok: function (oEvent) {

						this.close();
					},
					cancel: function () {
						this.close();
					},
					selectionChange: function (oEvent) {
						var sPath = oEvent.getParameter("tableSelectionParams").listItem.getBindingContextPath();
						that.getModel("data").setProperty("/context/CUSTOMER", that.getModel("CUSTOMERVH").getProperty(sPath).Customer);
						that.getModel("data").setProperty("/context/CUSTOMERNAME", that.getModel("CUSTOMERVH").getProperty(sPath).CustomerName);
						that.getModel("data").setProperty("/context/SHORTNAME", that.getModel("CUSTOMERVH").getProperty(sPath).SearchTerm1);
						that.getSaleman();
					}
				});
				this._oValueHelpDialogC.setTable(this._oMTableC);
				this._oValueHelpDialogC.setFilterBar(this._oFilterBarC);
			}

			this._oValueHelpDialogC.open();
		},
		onSearchCurrency: function (oEvent) {
			var that = this;

			//获取输入框绑定path
			this._sPath = oEvent.getSource().getBindingPath("value");

			//设置语言
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}

			if (!this._oMTableCUR) {
				var oSRColumnModel = new JSONModel();
				oSRColumnModel.setData({
					cols: [{
						label: "货币",
						template: "Currency"
					}, {
						label: "描述",
						template: "CurrencyName"
					}]
				});
				this._oMTableCUR = new mTable();
				this._oMTableCUR.setModel(oSRColumnModel, "columns");
				this._oMTableCUR.setModel(this.getModel("CURRENCYVH"), "CURRENCYVH");
				this._oMTableCUR.getModel("CURRENCYVH").attachBatchRequestCompleted(function (oEvent) {
					that._oValueHelpDialogCUR.setContentHeight("100%");
				});
			}

			// that._oMTableCUR.bindItems({
			// 	path: "CURRENCYVH>/YY1_CURRVH",
			// 	template: new sap.m.ColumnListItem({
			// 		cells: [
			// 			new Text({
			// 				text: "{CURRENCYVH>Currency}"
			// 			}),
			// 			new Text({
			// 				text: "{CURRENCYVH>CurrencyName}"
			// 			})
			// 		]
			// 	}),
			// 	filters: [
			// 		new Filter({
			// 			path: "Language",
			// 			operator: FilterOperator.EQ,
			// 			value1: sLanguage
			// 		})
			// 	]
			// });
			if (!this._oFilterBarCUR) {
				if (!this._CurrencyInput) {
					this._CurrencyInput = new Input({
						id: "Currency"
					});
				}

				if (!this._CurrencyNameInput) {
					this._CurrencyNameInput = new Input({
						id: "CurrencyName"
					});
				}

				this._oFilterBarCUR = new FilterBar({
					advancedMode: true,
					filterBarExpanded: true, //Device.system.phone,
					//showGoOnFB: !Device.system.phone,
					filterGroupItems: [new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "Currency",
							label: "币种",
							control: this._CurrencyInput,
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "CurrencyName",
							label: "币种描述",
							control: this._CurrencyNameInput,
							visibleInFilterBar: true
						})
					],
					search: function (oEvent) {
						var aSearchItems = oEvent.getParameters().selectionSet;
						var aFilters = [];
						for (var i = 0; i < aSearchItems.length; i++) {
							// sMsg += "/" + aSearchItems[i].getValue();
							if (aSearchItems[i].getValue() != "") {
								var filter = new Filter({
									path: aSearchItems[i].getId(),
									operator: FilterOperator.Contains,
									value1: aSearchItems[i].getValue()
								});
								aFilters.push(filter);
							}

						}
						var aFiltersLast = [new Filter({
								path: "Language",
								operator: FilterOperator.EQ,
								value1: sLanguage
							})
							// new Filter({
							// 	path: "CompanyCode",
							// 	operator: FilterOperator.EQ,
							// 	value1: that.getModel("Payment").getProperty("/Header/ApplicteCompany")
							// })
						];
						if (aFilters.length > 0) {
							aFiltersLast.push(new Filter({
								filters: aFilters,
								and: false
							}));
						}
						that._oMTableCUR.bindItems({
							path: "CURRENCYVH>/YY1_CURRVH",
							template: new sap.m.ColumnListItem({
								cells: [
									new Text({
										text: "{CURRENCYVH>Currency}"
									}),
									new Text({
										text: "{CURRENCYVH>CurrencyName}"
									})
								]
							}),
							filters: aFiltersLast
						});
						// that._oMTableCUR.bindItems({
						// 	path: "BANKGLACCOUNTVH>/YY1_BANKGLACCOUNTVH",
						// 	template: new sap.m.ColumnListItem({
						// 		cells: [
						// 			new Text({
						// 				text: "{BANKGLACCOUNTVH>GLAccount}"
						// 			}),
						// 			new Text({
						// 				text: "{BANKGLACCOUNTVH>GLAccountName}"
						// 			}),
						// 			new Text({
						// 				text: "{BANKGLACCOUNTVH>CompanyCode}"
						// 			})
						// 		]
						// 	}),
						// 	filters: aFiltersLast
						// });

					},
					clear: function (oEvent) {

					}
				});
			}

			if (!this._oValueHelpDialogCUR) {
				this._oValueHelpDialogCUR = new ValueHelpDialog("idValueHelpCUR", {
					supportRanges: false,
					supportMultiselect: false,
					key: "Currency",
					descriptionKey: "CurrencyName",
					title: "货币搜索",
					ok: function (oEvent) {
						this.close();
					},
					cancel: function () {
						this.close();
					},
					selectionChange: function (oEvent) {
						var sPath = oEvent.getParameter("tableSelectionParams").listItem.getBindingContextPath();
						that.getModel("data").setProperty("/context/CURRENCY", that.getModel("CURRENCYVH").getProperty(sPath).Currency);
						if (that.getModel("data").getProperty("/context/CURRENCY") !== that.getModel("data").getProperty("/context/COMCURRENCY")) {
							that.getCurrencyRate();
						}

					}
				});

			}
			this._oValueHelpDialogCUR.setTable(this._oMTableCUR);
			this._oValueHelpDialogCUR.setFilterBar(this._oFilterBarCUR);

			this._oValueHelpDialogCUR.open();

		},
		onBeforeUploadStarts: function (oEvent) {
			// 设置提交附件的参数
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "Slug",
				value: encodeURIComponent(oEvent.getParameter("fileName"))
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			var oBusinessObjectTypeName = new UploadCollectionParameter({
				name: "BusinessObjectTypeName",
				value: "DRAW"
			});
			oEvent.getParameters().addHeaderParameter(oBusinessObjectTypeName);

			var oLinkedSAPObjectKey = new UploadCollectionParameter({
				name: "LinkedSAPObjectKey",
				value: this.getModel("data").getProperty("/DocumentInfoRecord").DocumentInfoRecord
			});
			oEvent.getParameters().addHeaderParameter(oLinkedSAPObjectKey);

			var xCsrfToken = this.getModel("Attach").getSecurityToken();
			var oxsrfToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: xCsrfToken
			});
			oEvent.getParameters().addHeaderParameter(oxsrfToken);
		},
		onUploadComplete: function (oEvent) {
			this.getModel("Attach").refresh();
		},
		getSaleman: function () {
			this.setBusy(true);
			var oFilter1 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, this.getModel("data").getProperty(
				"/context/CUSTOMER"));
			var oFilter2 = new sap.ui.model.Filter("PartnerFunction", sap.ui.model.FilterOperator.EQ, "VE");
			var oFilter3 = new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.getModel("data").getProperty(
				"/context/COMPANYCODE"));
			var aFilters = [oFilter1, oFilter2, oFilter3];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					var Arry = !oData ? [] : oData.results;
					if (Arry.length !== 0) {
						this.getModel("data").setProperty("/context/SALEMAN", Arry[0].PersonFullName); //业务员	
					}
					this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
				}.bind(this),
			};
			this.getModel("SALEMAN").read("/YY1_Saleman", mParameters);
		},
		//取汇率
		getCurrencyRate: function () {
			var oFilter1 = new sap.ui.model.Filter("ExchangeRateEffectiveDate", sap.ui.model.FilterOperator.EQ, "2019-11-13T00:00:00");
			var oFilter2 = new sap.ui.model.Filter("TargetCurrency", sap.ui.model.FilterOperator.EQ, this.getModel("data").getProperty(
				"/context/CURRENCY"));
			var oFilter3 = new sap.ui.model.Filter("SourceCurrency", sap.ui.model.FilterOperator.EQ, this.getModel("data").getProperty(
				"/context/COMCURRENCY"));
			var oFilter4 = new sap.ui.model.Filter("ExchangeRateType", sap.ui.model.FilterOperator.EQ, "M");
			var aFilters = [oFilter1, oFilter2, oFilter3, oFilter4];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					// if()
					this.getModel("data").setProperty("/context/RATE", "1"); //汇率
					this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
				}.bind(this),
			};
			this.getModel("RATEVH").read("/YY1_RATEVH", mParameters);
		},
		changeMoneyToChinese: function (oEvent) {
			var RATE = this.getModel("data").getProperty("/context/RATE");
			var COMPANYCODE = this.getModel("data").getProperty("/context/COMPANYCODE");
			var CURRENCY = this.getModel("data").getProperty("/context/CURRENCY");
			if (RATE === "") {
				RATE = 1;
			}
			var fcode = this.getfcode(oEvent);
			switch (fcode) {
			case "ReceivingAmountTrans":
				var money = this.getModel("data").getProperty("/context/RAMOUNTT");
				break;
			case "ChargeInlandTrans":
				var money = this.getModel("data").getProperty("/context/CHARGEINLANDT");
				break;
			case "ChargeForeignTrans":
				var money = this.getModel("data").getProperty("/context/CHARGEFOREIGNT");
				break;
			}
			var cnNums = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); //汉字的数字  
			var cnIntRadice = new Array("", "拾", "佰", "仟"); //基本单位  
			var cnIntUnits = new Array("", "万", "亿", "兆"); //对应整数部分扩展单位  
			var cnDecUnits = new Array("角", "分", "毫", "厘"); //对应小数部分单位  
			//var cnInteger = "整"; //整数金额时后面跟的字符  
			var cnIntLast = "元"; //整型完以后的单位  
			var maxNum = 999999999999999.9999; //最大处理的数字  

			var IntegerNum; //金额整数部分  
			var DecimalNum; //金额小数部分  
			var ChineseStr = ""; //输出的中文金额字符串  
			var parts; //分离金额后用的数组，预定义  
			if (money === "") {
				return;
			}
			money = parseFloat(money);
			if (money >= maxNum) {
				MessageToast.show("超出最大处理数字");
				return;
			}
			if (money === 0) {
				ChineseStr = cnNums[0] + cnIntLast;
				switch (fcode) {
				case "ReceivingAmountTrans":
					this.getModel("data").setProperty("/context/CurrUpperCase1", ChineseStr);
					break;
				case "ChargeInlandTrans":
					this.getModel("data").setProperty("/context/CurrUpperCase2", ChineseStr);
					break;
				case "ChargeForeignTrans":
					this.getModel("data").setProperty("/context/CurrUpperCase3", ChineseStr);
					break;
				}
				return;
			}
			money = money.toString(); //转换为字符串  
			if (money.indexOf(".") === -1) {
				IntegerNum = money;
				DecimalNum = '';
			} else {
				parts = money.split(".");
				IntegerNum = parts[0];
				DecimalNum = parts[1].substr(0, 4);
			}
			if (parseInt(IntegerNum, 10) > 0) { //获取整型部分转换  
				var zeroCount = 0;
				var IntLen = IntegerNum.length;
				for (var i = 0; i < IntLen; i++) {
					var n = IntegerNum.substr(i, 1);
					var p = IntLen - i - 1;
					var q = p / 4;
					var m = p % 4;
					if (n == "0") {
						zeroCount++;
					} else {
						if (zeroCount > 0) {
							ChineseStr += cnNums[0];
						}
						zeroCount = 0; //归零  
						ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
					}
					if (m == 0 && zeroCount < 4) {
						ChineseStr += cnIntUnits[q];
					}
				}
				ChineseStr += cnIntLast;
				//整型部分处理完毕  
			}
			if (DecimalNum != '') { //小数部分  
				var decLen = DecimalNum.length;
				for (var i = 0; i < decLen; i++) {
					n = DecimalNum.substr(i, 1);
					if (n != '0') {
						ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
					}
				}
			}
			if (ChineseStr === '') {
				ChineseStr += cnNums[0] + cnIntLast;
			}
			switch (fcode) {
			case "ReceivingAmountTrans":
				this.getModel("data").setProperty("/context/CurrUpperCase1", ChineseStr);
				if (COMPANYCODE === '6310') {
					this.getModel("data").setProperty("/context/RAMOUNTL", parseFloat(RATE * money).toFixed(0));
				} else {
					this.getModel("data").setProperty("/context/RAMOUNTL", parseFloat(RATE * money).toFixed(2));
				}
				if (CURRENCY === 'TWD') {
					this.getModel("data").setProperty("/context/RAMOUNTT", parseInt(money));
				} else {
					this.getModel("data").setProperty("/context/RAMOUNTT", parseFloat(money).toFixed(2));
				}
				// this.getModel("data").setProperty("/context/RAMOUNTL", RATE * money);
				break;
			case "ChargeInlandTrans":
				this.getModel("data").setProperty("/context/CurrUpperCase2", ChineseStr);
				if (COMPANYCODE === "6310") {
					this.getModel("data").setProperty("/context/CHARGEINLANDL", parseFloat(RATE * money).toFixed(0));
				} else {
					this.getModel("data").setProperty("/context/CHARGEINLANDL", parseFloat(RATE * money).toFixed(2));
				}
				if (CURRENCY === "TWD") {
					this.getModel("data").setProperty("/context/CHARGEINLANDT", parseInt(money));
				} else {
					this.getModel("data").setProperty("/context/CHARGEINLANDT", parseFloat(money).toFixed(2));
				}
				// this.getModel("data").setProperty("/context/CHARGEINLANDL", RATE * money);
				break;
			case "ChargeForeignTrans":
				this.getModel("data").setProperty("/context/CurrUpperCase3", ChineseStr);
				if (COMPANYCODE === "6310") {
					this.getModel("data").setProperty("/context/CHARGEFOREIGNL", parseFloat(RATE * money).toFixed(0));
				} else {
					this.getModel("data").setProperty("/context/CHARGEFOREIGNL", parseFloat(RATE * money).toFixed(2));
				}
				if (CURRENCY === "TWD") {
					this.getModel("data").setProperty("/context/CHARGEFOREIGNT", parseInt(money));
				} else {
					this.getModel("data").setProperty("/context/CHARGEFOREIGNT", parseFloat(money).toFixed(2));
				}
				// this.getModel("data").setProperty("/context/CHARGEFOREIGNL", RATE * money);
				break;
			}
		},
		getfcode: function (oEvent) {
			// var sButId = oEvent.getParameter("id");
			// var aButId = sButId.split("-");
			// var iLast = parseInt(aButId.length) - 1;
			// var sOP = aButId[iLast].replace("button", "");
			// sOP = sOP.replace("but", "");
			// sOP = sOP.replace("bt", "");
			// return sOP;
			var sButId = oEvent.getParameter("id");
			var aButId = sButId.split("-");
			var sOP = aButId[2].replace("button", "");
			return sOP;
		},
		//客户
		handleChangeC: function () {
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			// var Customer = this._JSONModel.getData().REData.CUSTOMER;
			var Customer = this.getModel("data").getProperty("/context/CUSTOMER");
			var oFilter1 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, Customer);
			var oFilter2 = new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, sLanguage);
			var aFilters = [oFilter1, oFilter2];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					var Arry = !oData ? [] : oData.results;
					if (Arry.length !== 0) {
						// this._JSONModel.setProperty("/REData/CUSTOMERNAME", Arry[0].CustomerName);
						this.getModel("data").setProperty("/context/CUSTOMER", Arry[0].CustomerName);
					} else {
						MessageToast.show("客户不存在，请检查输入！");
						// this.setBusy(false);
						this.getModel("data").setProperty("/context/CUSTOMER", "");
						this.getModel("data").setProperty("/context/CUSTOMERNAME", "");
						// this._JSONModel.setProperty("/REData/CUSTOMER", "");
						// this._JSONModel.setProperty("/REData/CUSTOMERNAME", "");
						return;
					}
					this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
				}.bind(this)
			};
			this.getModel("CUSTOMERVH").read("/YY1_CUMTOMERVH", mParameters);

		},
		//银行账户
		handleChangeB: function () {
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			var BANKACCOUNT = this.getModel("data").getProperty("/context/BANKACCOUNT");
			var COMPANYCODE = this.getModel("data").getProperty("/context/COMPANYCODE");
			var REData = this._JSONModel.getData().REData;
			var oFilter1 = new sap.ui.model.Filter("GLAccount", sap.ui.model.FilterOperator.EQ, BANKACCOUNT);
			// var oFilter2 = new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, sLanguage);
			var oFilter3 = new sap.ui.model.Filter("CompanyCode", sap.ui.model.FilterOperator.EQ, COMPANYCODE);
			var aFilters = [oFilter1, oFilter3];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					var Arry = !oData ? [] : oData.results;
					if (Arry.length !== 0) {
						this.getModel("data").setProperty("/context/BANKACCOUNTDES", Arry[0].GLAccountName);
						// this._JSONModel.setProperty("/REData/BANKACCOUNTDES", Arry[0].GLAccountName);
					} else {
						MessageToast.show("账户不存在，请检查输入！");
						// this.setBusy(false);
						// this._JSONModel.setProperty("/REData/BANKACCOUNT", "");
						// this._JSONModel.setProperty("/REData/BANKACCOUNTDES", "");
						this.getModel("data").setProperty("/context/BANKACCOUNT", "");
						this.getModel("data").setProperty("/context/BANKACCOUNTDES", "");
						return;
					}
					this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
				}.bind(this)
			};
			this.getModel("BANKGLACCOUNTVH").read("/YY1_BANKGLACCOUNTVH", mParameters);
		},
		changeNCY: function () {
			this.setBusy(true);
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			switch (sLanguage) {
			case "zh-Hant":
			case "zh-TW":
				sLanguage = "ZF";
				break;
			case "zh-Hans":
			case "zh-CN":
				sLanguage = "ZH";
				break;
			case "EN":
			case "en":
				sLanguage = "EN";
				break;
			default:
				break;
			}
			var Currency = this.getModel("data").getProperty("/context/CURRENCY");
			Currency = Currency.toUpperCase();
			var oFilter1 = new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.EQ, Currency);
			var oFilter2 = new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, sLanguage);
			var aFilters = [oFilter1, oFilter2];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					var Arry = !oData ? [] : oData.results;
					if (Arry.length !== 0) {
						this.getCurrencyRate();
						this.getModel("data").setProperty("/context/CURRENCY", Arry[0].Currency);
						// this._JSONModel.setProperty("/REData/CURRENCY", Arry[0].Currency);
					} else {
						MessageToast.show("币种不存在，请检查输入！");
						// this.setBusy(false);
						// this._JSONModel.setProperty("/REData/CURRENCY", "");
						// this._JSONModel.setProperty("/REData/RATE", "");
						this.getModel("data").setProperty("/context/RATE", "");
						this.getModel("data").setProperty("/context/CURRENCY", "");
						this.setBusy(false);
						return;
					}
					this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					this.setBusy(false);
				}.bind(this)
			};
			this.getModel("CURRENCYVH").read("/YY1_CURRVH", mParameters);
		}, //取汇率
		getCurrencyRate: function () {
			var Currency = this.getModel("data").getProperty("/context/CURRENCY");
			var ComCurrency = this.getModel("data").getProperty("/context/COMCURRENCY");
			// var oFilter1 = new sap.ui.model.Filter("ExchangeRateEffectiveDate", sap.ui.model.FilterOperator.EQ, new Date());
			var oFilter2 = new sap.ui.model.Filter("TargetCurrency", sap.ui.model.FilterOperator.EQ, ComCurrency);
			var oFilter3 = new sap.ui.model.Filter("SourceCurrency", sap.ui.model.FilterOperator.EQ, Currency);
			var oFilter4 = new sap.ui.model.Filter("ExchangeRateType", sap.ui.model.FilterOperator.EQ, "M");
			var aFilters = [oFilter2, oFilter3, oFilter4];
			var mParameters = {
				filters: aFilters,
				success: function (oData) {
					var Arry = !oData ? [] : oData.results;
					for (var p = 0; p < Arry.length; p++) {
						var datetime = new Date(Arry[p].ExchangeRateEffectiveDate).getTime();
						Arry[p].datetime = datetime;
					}
					Arry.sort(sortDate);

					function sortDate(a, b) {
						return b.datetime - a.datetime;
					}
					if (Arry.length > 0) {
						this.getModel("data").setProperty("/context/RATE", Arry[0].ExchangeRate);
						// this._JSONModel.setProperty("/REData/RATE", Arry[0].ExchangeRate); //汇率 
					} else {
						this.getModel("data").setProperty("/context/RATE", "1");
						// this._JSONModel.setProperty("/REData/RATE", "1"); //汇率
					}
					// this._JSONModel.setProperty("/REData/RATE", "1"); //汇率
					// this.setBusy(false);
				}.bind(this),
				error: function (oError) {
					// this.setBusy(false);
				}.bind(this),
			};
			this.getModel("RATEVH").read("/YY1_RATEVH", mParameters);
		},
		onSearchOneCustomer: function (oEvent) {
			var that = this;
			//设置语言
			// var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			// switch (sLanguage) {
			// case "zh-Hant":
			// case "zh-TW":
			// 	sLanguage = "ZF";
			// 	break;
			// case "zh-Hans":
			// case "zh-CN":
			// 	sLanguage = "ZH";
			// 	break;
			// case "EN":
			// case "en":
			// 	sLanguage = "EN";
			// 	break;
			// default:
			// 	break;
			// }
			var CompanyCode = this.getModel("data").getProperty("/context/COMPANYCODE");
			// var CompanyCode = this._JSONModel.getData().REData.COMPANYCODE;
			if (!this._oMTableoneC) {
				var oOneCColumnModel = new JSONModel();
				oOneCColumnModel.setData({
					cols: [{
						label: "会计传票",
						template: "AccountingDocument"
					}, {
						label: "行项目",
						template: "LedgerGLLineItem"
					}, {
						label: "临时客户名称",
						template: "BusinessPartnerName1"
					}]
				});
				this._oMTableoneC = new mTable();
				this._oMTableoneC.setModel(oOneCColumnModel, "columns");
				this._oMTableoneC.setModel(this.getModel("ONETIMECUSTOMERVH"), "ONETIMECUSTOMERVH");
				this._oMTableoneC.getModel("ONETIMECUSTOMERVH").attachBatchRequestCompleted(function (oEvent) {
					that._oValueHelpDialogC.setContentHeight("100%");
				});
			}
			if (!this._oFilterBaroneC) {
				this._oFilterBaroneC = new FilterBar({
					advancedMode: true,
					filterBarExpanded: true, //Device.system.phone,
					//showGoOnFB: !Device.system.phone,
					filterGroupItems: [new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "AccountingDocument",
							label: "会计传票",
							control: new Input({
								id: "AccountingDocument"
							}),
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "LedgerGLLineItem",
							label: "行项目",
							control: new Input({
								id: "LedgerGLLineItem"
							}),
							visibleInFilterBar: true
						}),
						new FilterGroupItem({
							groupTitle: "More Fields",
							groupName: "gn1",
							name: "BusinessPartnerName1",
							label: "临时客户名称",
							control: new Input({
								id: "BusinessPartnerName1"
							}),
							visibleInFilterBar: true
						})
					],
					search: function (oEvent) {
						var aSearchItems = oEvent.getParameters().selectionSet;
						var aFilters = [];
						for (var i = 0; i < aSearchItems.length; i++) {
							// sMsg += "/" + aSearchItems[i].getValue();
							if (aSearchItems[i].getValue() != "") {
								var filter = new Filter({
									path: aSearchItems[i].getId(),
									operator: FilterOperator.Contains,
									value1: aSearchItems[i].getValue()
								});
								aFilters.push(filter);
							}

						}
						var aFiltersLast = [
							new Filter({
								path: "Ledger",
								operator: FilterOperator.EQ,
								value1: "2L"
							}),
							new Filter({
								path: "CompanyCode",
								operator: FilterOperator.EQ,
								value1: CompanyCode
							}),
							new Filter({
								path: "Customer",
								operator: FilterOperator.EQ,
								value1: "A109999"
							}),
							new Filter({
								path: "ClearingAccountingDocument",
								operator: FilterOperator.EQ,
								value1: ""
							}),
						];
						if (aFilters.length > 0) {
							aFiltersLast.push(new Filter({
								filters: aFilters,
								and: false
							}));
						}

						that._oMTableoneC.bindItems({
							path: "ONETIMECUSTOMERVH>/YY1_ONETIMECUSTOMERH",
							template: new sap.m.ColumnListItem({
								// type: "Navigation",
								cells: [
									new Text({
										text: "{ONETIMECUSTOMERVH>AccountingDocument}"
									}),
									new Text({
										text: "{ONETIMECUSTOMERVH>LedgerGLLineItem}"
									}),
									new Text({
										text: "{ONETIMECUSTOMERVH>BusinessPartnerName1}"
									})
								]
							}),
							filters: aFiltersLast
						});

					},
					clear: function (oEvent) {

					}
				});
			}

			if (!this._oValueHelpDialogoneC) {
				this._oValueHelpDialogoneC = new ValueHelpDialog("idValueHelponeC", {
					supportRanges: false,
					supportMultiselect: false,
					// filterMode: true,
					key: "ONETIMECUSTOMERNAME",
					descriptionKey: "ONETIMECUSTOMERNAME",
					title: "临时客户",
					ok: function (oEvent) {

						this.close();
					},
					cancel: function () {
						this.close();
					},
					selectionChange: function (oEvent) {
						var sPath = oEvent.getParameter("tableSelectionParams").listItem.getBindingContextPath();
						// that._JSONModel.setProperty("/REData/ONETIMECUSTOMERNAME", that.getModel("ONETIMECUSTOMERVH").getProperty(sPath).BusinessPartnerName1);
						this.getModel("data").setProperty("/context/ONETIMECUSTOMERNAME", that.getModel("ONETIMECUSTOMERVH").getProperty(sPath).BusinessPartnerName1);
						that._oMTableoneC.removeSelections(true);
						// that.getSaleman();
					}
				});
				this._oValueHelpDialogoneC.setTable(this._oMTableoneC);
				this._oValueHelpDialogoneC.setFilterBar(this._oFilterBaroneC);
			}

			this._oValueHelpDialogoneC.open();
		},

	});
});