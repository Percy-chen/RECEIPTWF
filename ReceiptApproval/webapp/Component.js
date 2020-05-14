 sap.ui.define([
 	"sap/ui/core/UIComponent",
 	"sap/ui/model/json/JSONModel",
 	"ReceiptApproval/model/models",
 	"ReceiptApproval/model/ContextModel",
 	"sap/m/MessageToast",
 	"ReceiptApproval/js/xml-js",
 	"sap/m/Dialog",
 	"sap/m/MessageView",
 	"sap/m/MessageItem",
 	"sap/m/Button",
 	"sap/m/Text",
 	"sap/m/Bar"
 ], function (UIComponent, JSONModel, models, ContextModel, MessageToast, xml, Dialog, MessageView, MessageItem, Button, Text, Bar) {
 	"use strict";

 	return UIComponent.extend("ReceiptApproval.Component", {

 		metadata: {
 			manifest: "json"
 		},

 		appModel: {
 			isBusy: false
 		},

 		/**
 		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
 		 * @public
 		 * @override
 		 */
 		init: function () {
 			var that = this;

 			// call the base component's init function
 			UIComponent.prototype.init.apply(this, arguments);

 			// set the device model
 			this.setModel(models.createDeviceModel(), "device");

 			// set application model
 			this.setModel(new JSONModel(this.appModel), "appModel");
 			this.setModel(models.createLocalModel());
 			this._JSONModel = this.getModel();
 			this.getModel("userAttributes").attachRequestCompleted(function (oEvent) {
 				var userAttributes = this.getData();
 				// this.setModel(userAttributes.displayname, "Approver");
 				that.getModel().setProperty("/Approver", userAttributes.name);
 				that.getUSER(userAttributes.name);
 				// that.getModel().setProperty("/ECRData/REQUESTER", userAttributes.displayname);
 			});

 			// get task instance ID	and read the process context
 			try {
 				var taskId = this._getTaskId();

 				var p = ContextModel.readContext(that, taskId);
 				p.then(function (oContext) {
 					// loading of context data was successfull

 					// TODO Here you can add some initialization if necessary
 					oContext.RESULT = "";
 					oContext.PostingDate = that.date(new Date());
 					oContext.DocumentDate = that.date(new Date());
 					// adding that "data" model. data.ctx contains the context
 					var oStartupParameters = that.getComponentData().startupParameters;
 					// 获取Parameters
 					var oQueryParameters = oStartupParameters.oParameters.oQueryParameters;
 					var oTaskData = oStartupParameters.taskModel.getData();
 					var oDataModel = new JSONModel({
 						context: oContext,
 						task: {
 							description: "",
 							title: oTaskData.TaskTitle,
 							priority: oTaskData.Priority,
 							priorityText: oTaskData.PriorityText,
 							status: oTaskData.Status,
 							statusText: oTaskData.StatusText,
 							createdOn: oTaskData.CreatedOn,
 							createdBy: oTaskData.CreatedBy
 						},
 						queryParameters: oQueryParameters
 					});
 					// Setting task description
 					oStartupParameters.inboxAPI.getDescription("NA", taskId)
 						.done(function (dataDescr) {
 							oDataModel.setProperty("/task/description", dataDescr.Description);
 						})
 						.fail(function (errorText) {
 							that._handleError.call(that, Error(errorText));
 						});

 					// set the model for binding
 					that.setModel(oDataModel, "data");
 					if (oQueryParameters.node[0] === "0020") {
 						that._JSONModel.setProperty("/appProperties/visible", true);
 						that.GetADoc(that, oContext.FLOW);
 					}

 					var PrintFlag = oDataModel.getData().context.Print;
 					if (PrintFlag === "X") {
 						that._addAction("Print", "GENERIC_PRINT_TITLE", "Accept", function () {
 							that._callbackAction(oDataModel, "Print");
 						});
 						that._addAction("OK", "GENERIC_OK_TITLE", "Accept", function () {
 							that._callbackAction(oDataModel, "OK");
 						});
 					} else {
 						that._addAction("Approve", "GENERIC_COMPLETE_TITLE", "Accept", function () {
 							that._callbackAction(oDataModel, "confirm");
 						});
 						that._addAction("Reject", "GENERIC_REJECT_TITLE", "Reject", function () {
 							that._callbackAction(oDataModel, "Reject");
 						});
 					}

 					// add buttons to approve and reject
 					// that._addAction("Approve", "GENERIC_COMPLETE_TITLE", "Accept", function (button) {
 					// 	that._callbackAction(oDataModel, "confirm");
 					// });

 					// that._addAction("Reject", "GENERIC_REJECT_TITLE", "Reject", function (button) {
 					// 	that._callbackAction(oDataModel, "Reject");
 					// });
 					// 绑定附件
 					if (oContext.DocumentInfoRecord) {
 						var DocumentInfoRecordDocType = oContext.DocumentInfoRecord.DocumentInfoRecordDocType;
 						var DocumentInfoRecordDocNumber = oContext.DocumentInfoRecord.DocumentInfoRecordDocNumber;
 						var DocumentInfoRecordDocVersion = oContext.DocumentInfoRecord.DocumentInfoRecordDocVersion;
 						var DocumentInfoRecordDocPart = oContext.DocumentInfoRecord.DocumentInfoRecordDocPart;
 					}

 					var path = "Attach>/A_DocumentInfoRecordAttch(DocumentInfoRecordDocType='" + DocumentInfoRecordDocType +
 						"',DocumentInfoRecordDocNumber='" + DocumentInfoRecordDocNumber + "',DocumentInfoRecordDocVersion='" +
 						DocumentInfoRecordDocVersion + "',DocumentInfoRecordDocPart='" + DocumentInfoRecordDocPart + "')";

 					that.getRootControl().byId("UploadCollectionAttach").bindElement(path);

 					// remove busy indicator
 					that.setBusy(false);
 				}, function (err) {
 					that._handleError.call(that, err);
 				});
 			} catch (err) {
 				that._handleError.call(that, err);
 			}
 		},
 		getUSER: function (User) {
 			this._ODataModel = this.getModel("GetEMPLOYEES");
 			var sPath = "/EMPLOYEES" + "('" + User + "')";
 			var mParameters = {
 				success: function (oData) {
 					this.getModel("data").setProperty("/context/Reference1InDocumentHeader", oData.FULLNAME);
 					var queryParameters = this.getModel("data").getData().queryParameters;
 					if (queryParameters.node !== undefined) {
 						if (queryParameters.node[0] === "0010") {
 							this.getModel("data").setProperty("/context/MANAGER", oData.FULLNAME);
 						}
 					}
 					// this.getModel("data").setProperty("/context/MANAGER", oData.FULLNAME);
 					// this.getModel().setProperty("/ApproverName", oData.FULLNAME);
 				}.bind(this)
 			};
 			this._ODataModel.read(sPath, mParameters);
 		},
 		_callbackAction: function (oDataModel, action) {
 			var that = this;
 			that._JSONModel.setProperty("/appProperties/busy", true);
 			var oData = oDataModel.getData();
 			var queryParameters = this.getModel("data").getData().queryParameters;
 			var context = oDataModel.getData().context;
 			var _checkAction = false;
 			if (action === "confirm") {
 				context.approved = true;
 				_checkAction = that._checkConfirmData(oDataModel.getData());
 			} else if (action === "Reject") {
 				context.approved = false;
 				var RESULT = context.RESULT;
 				if (RESULT === undefined || RESULT === "") {
 					MessageToast.show("请先输入审批意见");
 					that._JSONModel.setProperty("/appProperties/busy", false);
 					return;
 				}
 				that._callbackActionReject(oDataModel, action);
 				return; //直接退出
 			} else if (action === "Print") {
 				that.onPrint(context, that);
 				// that._refreshTask.call(that);
 			} else if (action === "OK") {
 				that.onPass(context, action);
 				// that._refreshTask.call(that);
 			}

 			if (_checkAction) {
 				// var taskId = that.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
 				// var p = ContextModel.triggerComplete(taskId, action, oDataModel.getData().context);
 				// p.then(function () {
 				// 	that._refreshTask.call(that);
 				// }, function (err) {
 				// 	that._handleError.call(that, err);
 				// });

 				//过账
 				that.getModel("appModel").setProperty("isBusy", true);
 				// var workflownode = oDataModel.getData().context.User.d.results[0].NODEID;
 				if (queryParameters.node[0] === "0020") {
 					var PostFlag = "";
 					PostFlag = oDataModel.getData().context.PostFlag;
 					if (PostFlag === "X") {
 						var message = that.getModel("i18n").getResourceBundle().getText("Mess1");
 						MessageToast.show(message);
 						return;
 					}
 					var context = oDataModel.getData().context;
 					that.postJournalEntry(context).then(function (response) {
 						//过账成功
 						if (that.handleJournalEntryResponse(response)) {
 							that.changeReceiptHistory(oDataModel);
 							that.completeWorkflowTasks(oDataModel, action);
 							that.getModel("appModel").setProperty("isBusy", false);
 						} else {
 							//过账失败
 							that.getModel("appModel").setProperty("isBusy", false);
 						}
 					}, function () {
 						//接口调用失败
 						that.getModel("appModel").setProperty("isBusy", false);
 						MessageToast.show("SOAP接口错误");
 					});
 				} else {
 					that.getModel("appModel").setProperty("isBusy", false);
 					that.completeWorkflowTasks(oDataModel, action);
 				}
 			}
 		},
 		handleJournalEntryResponse: function (response) {
 			this._JSONModel.setProperty("/appProperties/busy", false);
 			//弹出消息框
 			this.createMessageDialog();

 			// 处理返回消息
 			var responseJs = xml2js(response, {
 				compact: true
 			})["soap-env:Envelope"]["soap-env:Body"]["n0:JournalEntryBulkCreateConfirmation"];

 			//处理消息内容
 			var aMessageItems = responseJs.JournalEntryCreateConfirmation.Log.Item;
 			var aMessages = [];
 			if (aMessageItems.Note !== undefined) {
 				//成功 只传回一行
 				aMessages.push({
 					type: this.getMessageTypeFromSoap(aMessageItems.SeverityCode._text),
 					title: aMessageItems.TypeID._text,
 					description: aMessageItems.Note._text,
 					subtitle: aMessageItems.Note._text
 				});
 				var AccountingDocument = responseJs.JournalEntryCreateConfirmation.JournalEntryCreateConfirmation.AccountingDocument._text;
 				var CompanyCode = responseJs.JournalEntryCreateConfirmation.JournalEntryCreateConfirmation.CompanyCode._text;
 				var FiscalYear = responseJs.JournalEntryCreateConfirmation.JournalEntryCreateConfirmation.FiscalYear._text;
 				this.getModel("data").setProperty("/context/postedJournalEntry", {
 					AccountingDocument: AccountingDocument,
 					CompanyCode: CompanyCode,
 					FiscalYear: FiscalYear
 				});
 			} else {
 				// 失败传回多行
 				for (var i = 0; i < aMessageItems.length; i++) {
 					aMessages.push({
 						type: this.getMessageTypeFromSoap(aMessageItems[i].SeverityCode._text),
 						title: aMessageItems[i].TypeID._text,
 						description: aMessageItems[i].Note._text,
 						subtitle: aMessageItems[i].Note._text
 					});
 				}
 			}

 			this.oMessageView.setModel(new JSONModel({
 				Messages: aMessages
 			}), "postResults");
 			//打开消息框
 			this.oDialog.open();
 			this.oMessageView.navigateBack();

 			//根据返回的AccountingDocument字段,判断过账是否成功
 			if (responseJs.JournalEntryCreateConfirmation.JournalEntryCreateConfirmation.AccountingDocument._text === undefined) {
 				return false;
 			} else {
 				return true;
 			}

 		},
 		createMessageDialog: function () {
 			var that = this;

 			if (!this.oMessageView) {
 				var oMessageTemplate = new MessageItem({
 					type: '{postResults>type}',
 					title: '{postResults>title}',
 					description: '{postResults>description}',
 					subtitle: '{postResults>subtitle}'
 				});
 				this.oMessageView = new MessageView({
 					showDetailsPageHeader: false,
 					itemSelect: function () {
 						oBackButton.setVisible(true);
 					},
 					items: {
 						path: "postResults>/Messages",
 						template: oMessageTemplate
 					}
 				});
 			}
 			if (!this.oDialog) {
 				var oBackButton = new Button({
 					icon: sap.ui.core.IconPool.getIconURI("nav-back"),
 					visible: false,
 					press: function () {
 						that.oMessageView.navigateBack();
 						this.setVisible(false);
 					}
 				});
 				this.oDialog = new Dialog({
 					resizable: true,
 					content: this.oMessageView,
 					state: 'Error',
 					beginButton: new Button({
 						press: function () {
 							this.getParent().close();
 						},
 						text: "Close"
 					}),
 					customHeader: new Bar({
 						contentMiddle: [
 							new Text({
 								text: "消息"
 							})
 						],
 						contentLeft: [oBackButton]
 					}),
 					contentHeight: "300px",
 					contentWidth: "500px",
 					verticalScrolling: false
 				});
 			}
 			// this.getRootControl().byId("messagePopoverBtn").addDependent(this.oMP);
 		},
 		changeReceiptHistory: function (oDataModel) {
 			var that = this;
 			var oData = oDataModel.getData();
 			this.getReceipt(oDataModel).then(function (ReceiptHis) {
 				ReceiptHis.ACCOUNTINGDOCUMENT = oData.context.postedJournalEntry.AccountingDocument;
 				ReceiptHis.COMPANYCODE = oData.context.postedJournalEntry.CompanyCode;
 				ReceiptHis.FISCALYEAR = oData.context.postedJournalEntry.FiscalYear;
 				// var sPath = "/Header('" + oAppHeader.APPNUM + "')";
 				oData.context.patchHead = ReceiptHis;
 				// that.getModel("PAYMENTLOG").update(sPath, oAppHeader);
 			});
 		},
 		getReceipt: function (oDataModel) {
 			var that = this;
 			var promise = new Promise(function (resolve, reject) {
 				//获取Receipt历史数据
 				var sPath = "/RECEIPT('" + oDataModel.getData().context.FLOW + "')";
 				var mParameter = {
 					success: function (oData) {
 						resolve(oData);
 					},
 					error: function (oError) {
 						reject(oError);
 					}
 				};
 				that.getModel("RECEIPT").read(sPath, mParameter);
 			});
 			return promise;
 		},
 		completeWorkflowTasks: function (oDataModel, action) {
 			var that = this;
 			var oData = oDataModel.getData();
 			// var UserData = context.User.d.results;
 			var Approver = that.getModel().oData.Approver;
 			// for (var i = 0; i < UserData.length; i++) {
 			// 	if (UserData[i].APPROVALACCOUNT === Approver) {
 			// 		var NODEAPPROVER = UserData[i];
 			// 	}
 			// }
 			if (oData.context.approved === true) {
 				var SUGGESTION = "同意";
 			} else {
 				var SUGGESTION = "拒绝";
 			}
 			var LOGData = {
 				"STARTCOMPANY": oData.context.COMPANYCODE, //发起公司
 				"FLOWID": oData.context.workflowDefinitionId,
 				"INSTANCEID": oData.context.workflowInstanceId,
 				"NODEID": oData.queryParameters.node[0],
 				"SUBNODEID": oData.queryParameters.subnode[0],
 				"TASKINSTANCEID": that._getTaskId(),
 				// SNUMBER: NODEAPPROVER.SNUMBER, //序号
 				"DOCUMENT": oData.context.FLOW, //单号
 				"ACCOUNT": Approver,
 				// JOB: context.MAINENGINEER,//职位
 				"APPROVALDATE": new Date(), //审核日期
 				"CHANGEDATE": new Date(), //修改日期
 				"SUGGESTION": SUGGESTION, //审核结果
 				"RESULT": oData.context.RESULT //审核意见
 			};

 			// 填写审批历史记录

 			// 返写日志记录至Cloud Foundry HANA
 			that.postToCFHana(oData, LOGData).then(function (oSuccess) {
 				var taskId = that.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
 				var p = ContextModel.triggerComplete(taskId, action, oDataModel.getData().context);
 				p.then(function () {
 					that._refreshTask.call(that);
 				}, function (err) {
 					that._handleError.call(that, err);
 				});
 			}, function (oError) {
 				MessageToast.show("回写HANA日志失败，请稍后再试");
 			});
 		},
 		postToCFHana: function (oData, oLog) {
 			var that = this;
 			var promise = new Promise(function (resolve, reject) {
 				that.createNodeHistory(that, oLog).then(function (oData) {
 					resolve(oData);
 				}, function (oError) {
 					reject(oError);
 				});
 			});
 			return promise;
 		},
 		createNodeHistory: function (oController, oLog) {
 			var promise = new Promise(function (resolve, reject) {
 				var mParameter = {
 					success: function (oData) {
 						resolve(oData);
 					},
 					error: function (oError) {
 						reject(oError);
 					}
 				};
 				oController.getModel("WORKFLOWLOG").create("/WORKFLOWLOG", oLog, mParameter);
 			});
 			return promise;
 		},
 		/**
 		 * 
 		 */
 		_handleError: function (err) {
 			// to ensure busy indicator is off
 			this.setBusy(false);

 			// show a message box with the error
 			jQuery.sap.require("sap.m.MessageBox");
 			sap.m.MessageBox.error(err.toLocaleString(), {
 				title: this.getModel("i18n").getResourceBundle().getText("GENERIC_ERROR_TITLE")
 			});
 		},

 		/**
 		 *
 		 */
 		_checkConfirmData: function (oData) {
 			// TODO check data and return either true or false
 			return true;
 		},

 		/**
 		 *
 		 */
 		_checkRejectData: function (oData) {
 			// TODO check data and return either true or false
 			return true;
 		},

 		/**
 		 *
 		 */
 		setBusy: function (isBusy) {
 			var oModel = this.getModel("appModel");
 			oModel.setProperty("/isBusy", isBusy);
 			oModel.refresh();
 		},

 		/**
 		 *
 		 */
 		_getTaskId: function () {
 			var oCompontentData = this.getComponentData();
 			if (oCompontentData.startupParameters) {
 				var startupParameters = oCompontentData.startupParameters;
 				var taskData = startupParameters.taskModel.getData();
 				var taskId = taskData.InstanceID;

 				return taskId;
 			}

 			throw Error("no startupParameter available");
 		},

 		/**
 		 *
 		 */
 		_addAction: function (sName, sButtonText, sButtonType, fnPressed) {
 			var oCompontentData = this.getComponentData();
 			if (oCompontentData.startupParameters) {
 				var startupParameters = this.getComponentData().startupParameters;
 				startupParameters.inboxAPI.addAction({
 					action: sName,
 					label: this.getModel("i18n").getResourceBundle().getText(sButtonText),
 					type: sButtonType
 				}, fnPressed, this);
 			}
 		},

 		/**
 		 *
 		 */
 		_refreshTask: function () {
 			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", this._getTaskId());
 		},
 		postJournalEntry: function (oContext) {
 			var promise = new Promise(function (resolve, reject) {
 				function formatDate(date) {
 					var d = new Date(date),
 						month = '' + (d.getMonth() + 1),
 						day = '' + d.getDate(),
 						year = d.getFullYear();

 					if (month.length < 2) {
 						month = "0" + month;
 					}
 					if (day.length < 2) {
 						day = "0" + day;
 					}
 					return [year, month, day].join('-');
 				}
 				if (oContext.CHARGEFOREIGNL === "") { //手续费(国外)本币
 					oContext.CHARGEFOREIGNL = 0;
 				}
 				if (oContext.CHARGEFOREIGNT === "") { //手续费(国外)
 					oContext.CHARGEFOREIGNT = 0;
 				}
 				if (oContext.CHARGEINLANDL === "") { //手续费(国内)本币
 					oContext.CHARGEINLANDL = 0;
 				}
 				if (oContext.CHARGEINLANDT === "") { //手续费(国内)
 					oContext.CHARGEINLANDT = 0;
 				}
 				if (oContext.RAMOUNTL === "") { //收款金额
 					oContext.RAMOUNTL = 0;
 				}
 				if (oContext.RAMOUNTT === "") { //本币金额
 					oContext.RAMOUNTT = 0;
 				}
 				if (oContext.POSTAGEEXPENSE === "") { //邮资款
 					oContext.POSTAGEEXPENSE = 0;
 				}
 				if (oContext.POSTAGEEXPENSEL === "") { //本币金额
 					oContext.POSTAGEEXPENSEL = 0;
 				}
 				var lv_DocumentDate = formatDate(new Date(oContext.DocumentDate));
 				var lv_PostingDate = formatDate(new Date(oContext.PostingDate));
 				var lv_ValueDate = "";
 				if (oContext.BANKACCOUNT === "11810001") {
 					var lv_AssignmentReference = oContext.BILLNUMBER;
 					if (oContext.NETDUEDATE !== "") {
 						lv_ValueDate = formatDate(new Date(oContext.NETDUEDATE));
 					} else {
 						lv_ValueDate = lv_DocumentDate;
 					}
 				} else {
 					var lv_AssignmentReference = oContext.FLOW;
 					if (oContext.NETDUEDATE !== "") {
 						lv_ValueDate = formatDate(new Date(oContext.NETDUEDATE));
 					} else {
 						lv_ValueDate = lv_DocumentDate;
 					}
 				}
 				//临时客户逻辑
 				var lv_Country = "",
 					lv_CityName = "",
 					lv_SpecialGLCode = "";
 				if (oContext.ONETIMECUSTOMER === "是") {
 					if (oContext.COMPANYCODE === "1310") {
 						lv_Country = "CN";
 						lv_CityName = "深圳";
 					} else if (oContext.COMPANYCODE === "6310") {
 						lv_Country = "TW";
 						lv_CityName = "台北";
 					} else if (oContext.COMPANYCODE === "1710") {
 						lv_Country = "US";
 						lv_CityName = "California";
 					}
 				} else {
 					var lv_Country = "";
 					var lv_CityName = "";
 					var lv_SpecialGLCode = "A";
 				}
 				//邮资款+成本中心
 				var lv_CostCenter = "";
 				if (oContext.COMPANYCODE === "1310") {
 					lv_CostCenter = "0013101602";
 				} else if (oContext.COMPANYCODE === "6310") {
 					lv_CostCenter = "0063101603";
 				}
 				var lv_BANKACCOUNT = oContext.BANKACCOUNT.padStart(10, "0");
 				var lv_DocumentItemText = (oContext.FLOW + " " + oContext.SHORTNAME + " " + oContext.BILLNUMBER + "" + oContext.NOTE).substring(
 					0, 50);
 				var lv_AmountInTransactionCurrency = -(oContext.RAMOUNTT * 1000 + oContext.CHARGEINLANDT * 1000 + oContext.CHARGEFOREIGNT *
 						1000 +
 						oContext.POSTAGEEXPENSE * 1000) /
 					1000;
 				var result =
 					'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sfin="http://sap.com/xi/SAPSCORE/SFIN">' +
 					'<soapenv:Header/>' +
 					'<soapenv:Body>' +
 					'<sfin:JournalEntryBulkCreateRequest>' +
 					'<MessageHeader>' +
 					'<CreationDateTime>2019-10-07T00:08:09Z</CreationDateTime>' +
 					'</MessageHeader>' +
 					'<JournalEntryCreateRequest>' +
 					'<MessageHeader>' +
 					'<CreationDateTime>2019-10-07T00:08:09Z</CreationDateTime>' +
 					'</MessageHeader>' +
 					'<JournalEntry>' +
 					'<OriginalReferenceDocumentType>BKPFF</OriginalReferenceDocumentType>' +
 					'<OriginalReferenceDocument>00001</OriginalReferenceDocument>' +
 					'<BusinessTransactionType>RFBU</BusinessTransactionType>' +
 					'<OriginalReferenceDocumentLogicalSystem>SCP</OriginalReferenceDocumentLogicalSystem>' +
 					'<CreatedByUser>CC0000000001</CreatedByUser>' +
 					'<AccountingDocumentType>DZ</AccountingDocumentType>' +
 					'<ExchangeRate>' + oContext.RATE + '</ExchangeRate>' +
 					'<Reference1InDocumentHeader>' + oContext.Reference1InDocumentHeader + '</Reference1InDocumentHeader>' + //应付会计
 					'<Reference2InDocumentHeader>收款申请</Reference2InDocumentHeader>' +
 					'<DocumentReferenceID>' + oContext.FLOW + '</DocumentReferenceID>' + //流水单号
 					'<CompanyCode>' + oContext.COMPANYCODE + '</CompanyCode>' +
 					'<DocumentDate>' + lv_DocumentDate + '</DocumentDate>' +
 					'<PostingDate>' + lv_PostingDate + '</PostingDate>' +
 					'<DocumentHeaderText></DocumentHeaderText>' +

 					'<Item>' +
 					'<ReferenceDocumentItem>1</ReferenceDocumentItem>' +
 					'<GLAccount>' + lv_BANKACCOUNT + '</GLAccount>' +
 					'<ValueDate>' + lv_ValueDate + '</ValueDate>' + //到期日
 					'<AmountInTransactionCurrency currencyCode="' + oContext.CURRENCY + '">' + oContext.RAMOUNTT + //收款金额
 					'</AmountInTransactionCurrency>' +
 					'<DocumentItemText>' + lv_DocumentItemText + '</DocumentItemText>' +
 					'<AssignmentReference>' + lv_AssignmentReference + '</AssignmentReference>' +
 					'<DebitCreditCode>S</DebitCreditCode>' +
 					'</Item>' +

 					'<Item>' + //国内手续费
 					'<ReferenceDocumentItem>1</ReferenceDocumentItem>' +
 					'<GLAccount>0061320008</GLAccount>' +
 					'<ValueDate>' + lv_ValueDate + '</ValueDate>' + //到期日
 					'<AmountInTransactionCurrency currencyCode="' + oContext.CURRENCY + '">' + oContext.CHARGEINLANDT +
 					'</AmountInTransactionCurrency>' +
 					'<DocumentItemText>' + lv_DocumentItemText + '</DocumentItemText>' +
 					'<AssignmentReference>' + oContext.FLOW + '</AssignmentReference>' +
 					'<DebitCreditCode>S</DebitCreditCode>' +
 					'<AccountAssignment>' +
 					'<CostCenter>' + lv_CostCenter + '</CostCenter>' +
 					'</AccountAssignment>' +
 					'</Item>' +

 					'<Item>' + //国外手续费
 					'<ReferenceDocumentItem>1</ReferenceDocumentItem>' +
 					'<GLAccount>0061320009</GLAccount>' +
 					'<ValueDate>' + lv_DocumentDate + '</ValueDate>' + //过账日期
 					'<AmountInTransactionCurrency currencyCode="' + oContext.CURRENCY + '">' + oContext.CHARGEFOREIGNT +
 					'</AmountInTransactionCurrency>' +
 					'<DocumentItemText>' + lv_DocumentItemText + '</DocumentItemText>' +
 					'<AssignmentReference>' + oContext.FLOW + '</AssignmentReference>' +
 					'<DebitCreditCode>S</DebitCreditCode>' +
 					'<AccountAssignment>' +
 					'<CostCenter>' + lv_CostCenter + '</CostCenter>' +
 					'</AccountAssignment>' +
 					'</Item>' +

 					'<Item>' + //邮资款
 					'<ReferenceDocumentItem>1</ReferenceDocumentItem>' +
 					'<GLAccount>0061160006</GLAccount>' +
 					'<ValueDate>' + lv_DocumentDate + '</ValueDate>' + //过账日期
 					'<AmountInTransactionCurrency currencyCode="' + oContext.CURRENCY + '">' + oContext.POSTAGEEXPENSE +
 					'</AmountInTransactionCurrency>' +
 					'<DocumentItemText>' + lv_DocumentItemText + '</DocumentItemText>' +
 					'<AssignmentReference>' + oContext.FLOW + '</AssignmentReference>' +
 					'<DebitCreditCode>S</DebitCreditCode>' +
 					'<AccountAssignment>' +
 					'<CostCenter>' + lv_CostCenter + '</CostCenter>' +
 					'</AccountAssignment>' +
 					'</Item>' +

 					'<DebtorItem>' +
 					'<ReferenceDocumentItem>2</ReferenceDocumentItem>' +
 					'<Debtor>' + oContext.CUSTOMER + '</Debtor>' +
 					'<AmountInTransactionCurrency currencyCode="' + oContext.CURRENCY + '">' + lv_AmountInTransactionCurrency +
 					'</AmountInTransactionCurrency>' +
 					'<DebitCreditCode>H</DebitCreditCode>' +
 					'<DocumentItemText>' + lv_DocumentItemText + '</DocumentItemText>' +
 					'<BusinessPlace>' + oContext.COMPANYCODE + '</BusinessPlace>' +
 					'<AssignmentReference>' + oContext.ASSIGNMENT + '</AssignmentReference>' +
 					'<DownPaymentTerms>' +
 					'<SpecialGLCode>' + lv_SpecialGLCode + '</SpecialGLCode>' +
 					'</DownPaymentTerms>' +
 					'<CashDiscountTerms>' +
 					'<DueCalculationBaseDate>' + lv_DocumentDate + '</DueCalculationBaseDate>' +
 					'<CashDiscount1Days>0</CashDiscount1Days>' +
 					'<CashDiscount1Percent>0</CashDiscount1Percent>' +
 					'<CashDiscount2Days>0</CashDiscount2Days>' +
 					'<CashDiscount2Percent>0</CashDiscount2Percent>' +
 					'<NetPaymentDays>0</NetPaymentDays>' +
 					'</CashDiscountTerms>' +
 					'</DebtorItem>' +
 					'</JournalEntry>' +
 					'</JournalEntryCreateRequest>' +
 					'</sfin:JournalEntryBulkCreateRequest>' +
 					'</soapenv:Body>' +
 					'</soapenv:Envelope>';

 				// 拼接抬头
 				// result =
 				// 	"<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:sfin=\"http://sap.com/xi/SAPSCORE/SFIN\"><soapenv:Header/><soapenv:Body><sfin:JournalEntryBulkCreateRequest>" +
 				// 	result + "</sfin:JournalEntryBulkCreateRequest></soapenv:Body></soapenv:Envelope>";

 				var BearAuth = 'Basic ' + btoa("SCP_INBOUND" + ":" + "P@ssw0rd123456789012");

 				$.ajax({
 					url: "/html5apps/receiptwf/destinations/WT_S4HC_SOAP/sap/bc/srt/scs_ext/sap/journalentrycreaterequestconfi?sap-client=100",
 					method: "POST",
 					dataType: "text",
 					contentType: "text/xml;charset=\"utf-8\"",
 					Accept: "text/html",
 					data: result,
 					username: "SCP_INBOUND",
 					password: "P@ssw0rd123456789012",
 					// headers: {
 					// 	"Authorization": BearAuth
 					// },
 					success: function (result, xhr, data) {
 						resolve(data.responseText);
 					},
 					error: function (xhr, textStatus, errorText) {
 						reject(xhr);
 					}
 				});
 			});
 			return promise;
 		},
 		_callbackActionReject: function (oDataModel, action) {
 			var that = this;
 			that._JSONModel.setProperty("/appProperties/busy", true);
 			var _checkAction = true;
 			var oData = oDataModel.getData();
 			// var UserData = context.User.d.results;
 			var Approver = that.getModel().oData.Approver;
 			// for (var i = 0; i < UserData.length; i++) {
 			// 	if (UserData[i].APPROVALACCOUNT === Approver) {
 			// 		var NODEAPPROVER = UserData[i];
 			// 	}
 			// }
 			if (oData.context.approved === true) {
 				var SUGGESTION = "同意";
 			} else {
 				var SUGGESTION = "拒绝";
 			}
 			if (_checkAction) {
 				// 填写审批历史记录
 				var SaveLog = {
 					"STARTCOMPANY": oData.context.COMPANYCODE, //发起公司
 					"FLOWID": oData.context.workflowDefinitionId,
 					"INSTANCEID": oData.context.workflowInstanceId,
 					"NODEID": oData.queryParameters.node[0],
 					"SUBNODEID": oData.queryParameters.subnode[0],
 					"TASKINSTANCEID": that._getTaskId(),
 					// SNUMBER: NODEAPPROVER.SNUMBER, //序号
 					"DOCUMENT": oData.context.FLOW, //单号
 					"ACCOUNT": Approver, //审核人员
 					// JOB: context.MAINENGINEER,//职位
 					"APPROVALDATE": new Date(), //审核日期
 					"CHANGEDATE": new Date(), //修改日期
 					"SUGGESTION": SUGGESTION, //审核结果
 					"RESULT": oData.context.RESULT //审核意见
 				};
 				oData.context.currentAction = action;
 				// context.approvalLogs.push(SaveLog);

 				// 返写日志记录至Cloud Foundry HANA
 				that.postToCFHana(oData, SaveLog).then(function (oSuccess) {
 					var taskId = that.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
 					var p = ContextModel.triggerComplete(taskId, action, oDataModel.getData().context);
 					p.then(function () {
 						that._refreshTask.call(that);
 						that._JSONModel.setProperty("/appProperties/busy", false);
 					}, function (err) {
 						that._handleError.call(that, err);
 						that._JSONModel.setProperty("/appProperties/busy", false);
 					});
 				}, function (oError) {
 					that._JSONModel.setProperty("/appProperties/busy", false);
 					MessageToast.show("回写HANA日志失败，请稍后再试");
 				});

 			}
 		},
 		getMessageTypeFromSoap: function (SeverityCode) {
 			switch (SeverityCode) {
 			case "1":
 				return "Success";
 			case "3":
 				return "Error";
 			case "2":
 				return "Warning";
 			}
 		},
 		onPrint: function (context, that) {
 			that._JSONModel.setProperty("/appProperties/busy", true);
 			var customerGLName = that.getModel("i18n").getResourceBundle().getText("customerGL"); //客户科目描述22210001
 			var costTransName = that.getModel("i18n").getResourceBundle().getText("costTrans"); //国外手续费科目描述61340009
 			var costLocalName = that.getModel("i18n").getResourceBundle().getText("costLocal"); //国内手续费科目描述61340008
 			var PostGLName = that.getModel("i18n").getResourceBundle().getText("PostGL"); //邮资款描述61160006
 			var url = "/html5apps/receiptwf/destinations/Print/ws/data/print/receipt";
 			var language = sap.ui.getCore().getConfiguration().getLanguage();
 			switch (language) {
 			case "zh-Hant":
 			case "zh-TW":
 				language = "zh_CN_F";
 				break;
 			case "zh-Hans":
 			case "zh-CN":
 				language = "zh_CN";
 				break;
 			case "EN":
 			case "en":
 				language = "en_GB";
 				break;
 			default:
 				break;
 			}
 			if (context.CHARGEFOREIGNL === "") { //手续费(国外)本币
 				context.CHARGEFOREIGNL = 0;
 			}
 			if (context.CHARGEFOREIGNT === "") { //手续费(国外)
 				context.CHARGEFOREIGNT = 0;
 			}
 			if (context.CHARGEINLANDL === "") { //手续费(国内)本币
 				context.CHARGEINLANDL = 0;
 			}
 			if (context.CHARGEINLANDT === "") { //手续费(国内)
 				context.CHARGEINLANDT = 0;
 			}
 			if (context.RAMOUNTL === "") { //收款金额
 				context.RAMOUNTL = 0;
 			}
 			if (context.RAMOUNTT === "") { //本币金额
 				context.RAMOUNTT = 0;
 			}
 			if (context.POSTAGEEXPENSE === "") { //邮资款
 				context.POSTAGEEXPENSE = 0;
 			}
 			if (context.POSTAGEEXPENSEL === "") { //邮资款
 				context.POSTAGEEXPENSEL = 0;
 			}

 			var lv_AmountInTransactionCurrency = -(context.RAMOUNTT * 1000 + context.CHARGEINLANDT * 1000 + context.CHARGEFOREIGNT * 1000) /
 				1000;
 			var lv_AmountInCompCurrency = -(context.RAMOUNTL * 1000 + context.CHARGEINLANDL * 1000 + context.CHARGEFOREIGNL * 1000) /
 				1000;
 			var itemNum = 10;
 			var param = [];
 			if (parseInt(context.RAMOUNTL) !== 0) {
 				var param1 = {
 					"flow": context.FLOW,
 					"itemNum": itemNum,
 					"applicationDate": new Date(context.APPLICATIONDATE),
 					"applicant": context.APPLICANTNAME,
 					"companyName": context.COMPANYNAME,
 					"company": context.COMPANYCODE,
 					"bankAccount": context.BANKACCOUNT,
 					"customer": context.CUSTOMER,
 					"customerName": context.CUSTOMERNAME,
 					"saleMan": context.SALEMAN,
 					"assignment": context.ASSIGNMENT,
 					"netDueDate": new Date(context.NETDUEDATE),
 					"billNumber": context.BILLNUMBER,
 					"currency": context.CURRENCY,
 					"rate": context.RATE,
 					"lamount": "0.00",
 					"balance": "0.00",
 					"ramountl": context.RAMOUNTL,
 					"ramountt": context.RAMOUNTT,
 					// "chargeinlandt": context.CHARGEINLANDT,
 					// "chargeinlandl": context.CHARGEINLANDL,
 					// "chargeforeignt": context.CHARGEFOREIGNT,
 					// "chargeforeignl": context.CHARGEFOREIGNL,
 					"note": context.NOTE,
 					"accountingDocument": "",
 					"companyCode": context.COMPANYCODE,
 					"fiscalYear": "",
 					"debitCreditCode": "S",
 					"glAccountName": context.BANKACCOUNTDES,
 					"manager": context.MANAGER
 				};
 				itemNum = itemNum + 10;
 				param.push(param1);
 			}
 			if (parseInt(context.CHARGEINLANDL) !== 0) {
 				var param2 = { //国内
 					"flow": context.FLOW,
 					"itemNum": itemNum,
 					"applicationDate": new Date(context.APPLICATIONDATE),
 					"applicant": context.APPLICANTNAME,
 					"companyName": context.COMPANYNAME,
 					"company": context.COMPANYCODE,
 					"bankAccount": "61320009",
 					"customer": context.CUSTOMER,
 					"customerName": context.CUSTOMERNAME,
 					"saleMan": context.SALEMAN,
 					"assignment": context.ASSIGNMENT,
 					"netDueDate": new Date(context.NETDUEDATE),
 					"billNumber": context.BILLNUMBER,
 					"currency": context.CURRENCY,
 					"rate": context.RATE,
 					"lamount": "0.00",
 					"balance": "0.00",
 					"ramountl": context.CHARGEINLANDL,
 					"ramountt": context.CHARGEINLANDT,
 					// "chargeinlandt": context.CHARGEINLANDT,
 					// "chargeinlandl": context.CHARGEINLANDL,
 					// "chargeforeignt": context.CHARGEFOREIGNT,
 					// "chargeforeignl": context.CHARGEFOREIGNL,
 					"note": context.NOTE,
 					"accountingDocument": "",
 					"companyCode": context.COMPANYCODE,
 					"fiscalYear": "",
 					"debitCreditCode": "S",
 					"glAccountName": costLocalName,
 					"manager": context.MANAGER
 				};
 				itemNum = itemNum + 10;
 				param.push(param2);
 			}
 			if (parseInt(context.CHARGEFOREIGNL) !== 0) {
 				var param3 = { //国外
 					"flow": context.FLOW,
 					"itemNum": itemNum,
 					"applicationDate": new Date(context.APPLICATIONDATE),
 					"applicant": context.APPLICANTNAME,
 					"companyName": context.COMPANYNAME,
 					"company": context.COMPANYCODE,
 					"bankAccount": "61320008",
 					"customer": context.CUSTOMER,
 					"customerName": context.CUSTOMERNAME,
 					"saleMan": context.SALEMAN,
 					"assignment": context.ASSIGNMENT,
 					"netDueDate": new Date(context.NETDUEDATE),
 					"billNumber": context.BILLNUMBER,
 					"currency": context.CURRENCY,
 					"rate": context.RATE,
 					"lamount": "0.00",
 					"balance": "0.00",
 					"ramountl": context.CHARGEFOREIGNL,
 					"ramountt": context.CHARGEFOREIGNT,
 					// "chargeinlandt": context.CHARGEINLANDT,
 					// "chargeinlandl": context.CHARGEINLANDL,
 					// "chargeforeignt": context.CHARGEFOREIGNT,
 					// "chargeforeignl": context.CHARGEFOREIGNL,
 					"note": context.NOTE,
 					"accountingDocument": "",
 					"companyCode": context.COMPANYCODE,
 					"fiscalYear": "",
 					"debitCreditCode": "S",
 					"glAccountName": costTransName,
 					"manager": context.MANAGER
 				};
 				itemNum = itemNum + 10;
 				param.push(param3);
 			}
 			if (parseInt(context.POSTAGEEXPENSE) !== 0) {
 				var param4 = { //邮资款
 					"flow": context.FLOW,
 					"itemNum": itemNum,
 					"applicationDate": new Date(context.APPLICATIONDATE),
 					"applicant": context.APPLICANTNAME,
 					"companyName": context.COMPANYNAME,
 					"company": context.COMPANYCODE,
 					"bankAccount": "61160006",
 					"customer": context.CUSTOMER,
 					"customerName": context.CUSTOMERNAME,
 					"saleMan": context.SALEMAN,
 					"assignment": context.ASSIGNMENT,
 					"netDueDate": new Date(context.NETDUEDATE),
 					"billNumber": context.BILLNUMBER,
 					"currency": context.CURRENCY,
 					"rate": context.RATE,
 					"lamount": "0.00",
 					"balance": "0.00",
 					"ramountl": context.POSTAGEEXPENSE,
 					"ramountt": context.POSTAGEEXPENSEL,
 					// "chargeinlandt": context.CHARGEINLANDT,
 					// "chargeinlandl": context.CHARGEINLANDL,
 					// "chargeforeignt": context.CHARGEFOREIGNT,
 					// "chargeforeignl": context.CHARGEFOREIGNL,
 					"note": context.NOTE,
 					"accountingDocument": "",
 					"companyCode": context.COMPANYCODE,
 					"fiscalYear": "",
 					"debitCreditCode": "S",
 					"glAccountName": PostGLName,
 					"manager": context.MANAGER
 				};
 				itemNum = itemNum + 10;
 				param.push(param4);
 			}
 			if (parseInt(lv_AmountInCompCurrency) !== 0) {
 				var param5 = { //客户
 					"flow": context.FLOW,
 					"itemNum": itemNum,
 					"applicationDate": new Date(context.APPLICATIONDATE),
 					"applicant": context.APPLICANTNAME,
 					"companyName": context.COMPANYNAME,
 					"company": context.COMPANYCODE,
 					"bankAccount": "22210001",
 					"customer": context.CUSTOMER,
 					"customerName": context.CUSTOMERNAME,
 					"saleMan": context.SALEMAN,
 					"assignment": context.ASSIGNMENT,
 					"netDueDate": new Date(context.NETDUEDATE),
 					"billNumber": context.BILLNUMBER,
 					"currency": context.CURRENCY,
 					"rate": context.RATE,
 					"lamount": "0.00",
 					"balance": "0.00",
 					"ramountl": lv_AmountInCompCurrency,
 					"ramountt": lv_AmountInTransactionCurrency,
 					// "chargeinlandt": context.CHARGEINLANDT,
 					// "chargeinlandl": context.CHARGEINLANDL,
 					// "chargeforeignt": context.CHARGEFOREIGNT,
 					// "chargeforeignl": context.CHARGEFOREIGNL,
 					"note": context.NOTE,
 					"accountingDocument": "",
 					"companyCode": context.COMPANYCODE,
 					"fiscalYear": "",
 					"debitCreditCode": "H",
 					"glAccountName": customerGLName,
 					"manager": context.MANAGER
 				};
 				itemNum = itemNum + 10;
 				param.push(param5);
 			}
 			var xhr = new XMLHttpRequest();
 			xhr.responseType = "blob";
 			xhr.open("POST", url, true);
 			xhr.setRequestHeader("content-Type", "application/json");
 			xhr.setRequestHeader("accept-language", language);
 			// var that = this;
 			xhr.onload = function (e) {
 				var sUrl = window.URL.createObjectURL(this.response);
 				that._JSONModel.setProperty("/appProperties/busy", false);
 				var link = document.createElement("a");
 				link.style.display = "none";
 				link.href = sUrl;
 				link.target = "_blank";
 				// link.setAttribute('download', '11111.pdf');
 				document.body.appendChild(link);
 				link.click();
 				document.body.removeChild(link);
 			};
 			xhr.send(JSON.stringify(param));
 			// var taskId = this.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
 			// var p = ContextModel.triggerComplete(taskId, action, context);
 			// var that = this;
 			// p.then(function () {
 			// 	that._refreshTask.call(that);
 			// }, function (err) {
 			// 	that._handleError.call(that, err);
 			// });

 		},
 		onPass: function (context, action) {
 			var taskId = this.oComponentData.inboxHandle.attachmentHandle.detailModel.getData().InstanceID;
 			var p = ContextModel.triggerComplete(taskId, action, context);
 			var that = this;
 			p.then(function () {
 				that._refreshTask.call(that);
 			}, function (err) {
 				that._handleError.call(that, err);
 			});

 		},
 		// 日期格式化
 		date: function (value) {
 			if (value) {
 				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
 					pattern: "yyyy-MM-dd"
 				});
 				return oDateFormat.format(new Date(value));
 			} else {
 				return value;
 			}
 		},
 		GetADoc: function (that, Flow) {
 			var aFilters = [];
 			var oFilter1 = new sap.ui.model.Filter("DocumentReferenceID", sap.ui.model.FilterOperator.EQ, Flow);
 			aFilters.push(oFilter1);
 			that._ODataModel = that.getModel("ACCTGDOC");
 			var mParameters = {
 				filters: aFilters,
 				success: function (oData) {
 					if (oData.results.length > 0) {
 						that.getModel("data").setProperty("/context/PostFlag", "X");
 					} else {
 						that.getModel("data").setProperty("/context/PostFlag", "");
 					}
 				}.bind(that)
 			};
 			that._ODataModel.read("/A_OperationalAcctgDocItemCube", mParameters);
 		}
 	});
 });