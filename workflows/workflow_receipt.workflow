{
	"contents": {
		"7a36580b-9bb8-4b49-be40-0b03dff24f8b": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "workflow_receipt",
			"subject": "收款单据${context.FLOW}",
			"name": "workflow_receipt",
			"lastIds": "e42fad05-4f32-4ff3-9e5c-7efa0079067f",
			"events": {
				"a98512ca-dd16-489b-8887-43126d07397b": {
					"name": "申请"
				},
				"08690bd6-5e65-4729-b3e0-41a018682146": {
					"name": "流程结束"
				}
			},
			"activities": {
				"9679c958-db35-4e90-b739-44f0404cac27": {
					"name": "获取财务主管"
				},
				"47dfea46-41d9-41d0-a393-e6d4374f83bb": {
					"name": "审批人信息处理"
				},
				"5d82eea7-f5f7-44ee-8582-280004537416": {
					"name": "财务主管审批"
				},
				"3ddd6d54-44b6-4576-881f-7dbe39622b40": {
					"name": "is Approved?"
				},
				"b2d74a6d-7277-4055-92b0-c5668f33014b": {
					"name": "获取审批人"
				},
				"d3d230df-ee27-4c1b-aad5-fbf651bedd9b": {
					"name": "审批人信息处理"
				},
				"3e4d6abf-0f68-441c-ac58-03c36aca4179": {
					"name": "审批"
				},
				"e0f32322-3a1e-4c96-9ed4-055dd229b483": {
					"name": "is Approved?"
				},
				"f0038233-670a-4b0d-a695-95300a326b8a": {
					"name": "录入收款信息"
				},
				"fb23f0cb-cdf2-47c1-8b03-0897e79299bd": {
					"name": "应收会计打印"
				},
				"404c3e30-0ec2-4fdd-9d1a-5c79d3e0beb8": {
					"name": "打印"
				}
			},
			"sequenceFlows": {
				"d9a12c2e-20b1-49c7-92da-1ac043e79a7b": {
					"name": "SequenceFlow1"
				},
				"2adff7ba-efd7-45b4-a833-6b6aa233b147": {
					"name": "SequenceFlow2"
				},
				"8baa8047-9bc9-4e0c-a777-0cd39275c4cf": {
					"name": "SequenceFlow3"
				},
				"aff279a5-135a-4332-a208-444aa4cd8917": {
					"name": "SequenceFlow4"
				},
				"9675916e-4611-443a-ae28-511e91fcddb3": {
					"name": "YES"
				},
				"109c12f1-04af-464b-bda4-36f59b421554": {
					"name": "SequenceFlow6"
				},
				"48da7233-cd42-4455-a0a2-accc89eb98e7": {
					"name": "NO"
				},
				"a8508958-d7b1-4b5e-9463-6a2b1e9367cc": {
					"name": "SequenceFlow8"
				},
				"e24e41bf-3bca-4d17-848d-d262be16cd33": {
					"name": "SequenceFlow9"
				},
				"57ea6e3e-18df-4dd3-b718-7fa546d817ad": {
					"name": "YES"
				},
				"b9837bc7-1e26-4fb9-9aab-1d67e2628ccd": {
					"name": "NO"
				},
				"ad0ce294-d000-447c-bb7c-38100e64c7ec": {
					"name": "SequenceFlow12"
				},
				"b80534f6-9d6a-4efe-a7c4-ecb21696cbb9": {
					"name": "SequenceFlow14"
				},
				"a99a1c70-286b-412d-9cc9-60f776ff0b2d": {
					"name": "SequenceFlow15"
				}
			},
			"diagrams": {
				"967a0a93-e1fe-4ba4-9512-61de9381007e": {}
			}
		},
		"a98512ca-dd16-489b-8887-43126d07397b": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "申请"
		},
		"08690bd6-5e65-4729-b3e0-41a018682146": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "流程结束"
		},
		"9679c958-db35-4e90-b739-44f0404cac27": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "APLEXHANAWORKFLOW",
			"path": "/WORKFLOWNODE.xsodata/WORKFLOWNODE?$filter= FLOWID eq 'workflow_receipt' and NODEID eq '0010' and STARTCOMPANY eq '${context.COMPANYCODE}'",
			"httpMethod": "GET",
			"responseVariable": "${context.User}",
			"id": "servicetask1",
			"name": "获取财务主管"
		},
		"47dfea46-41d9-41d0-a393-e6d4374f83bb": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/workflow_receipt/DEALINFO.js",
			"id": "scripttask1",
			"name": "审批人信息处理"
		},
		"5d82eea7-f5f7-44ee-8582-280004537416": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "收款单据${context.FLOW}审批",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://html5apps/receiptwf/ReceiptApproval/webapp/ReceiptApproval",
			"recipientUsers": "${context.approvalTree[\"node0010\"][\"subNode0010\"].account}",
			"userInterfaceParams": [{
				"key": "node",
				"value": "0010"
			}, {
				"key": "subnode",
				"value": "0010"
			}],
			"id": "usertask1",
			"name": "财务主管审批"
		},
		"3ddd6d54-44b6-4576-881f-7dbe39622b40": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway1",
			"name": "is Approved?",
			"default": "9675916e-4611-443a-ae28-511e91fcddb3"
		},
		"b2d74a6d-7277-4055-92b0-c5668f33014b": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "APLEXHANAWORKFLOW",
			"path": "/WORKFLOWNODE.xsodata/WORKFLOWNODE?$filter= FLOWID eq 'workflow_receipt' and NODEID eq '0020' and STARTCOMPANY eq '${context.COMPANYCODE}'",
			"httpMethod": "GET",
			"responseVariable": "${context.User}",
			"id": "servicetask2",
			"name": "获取审批人"
		},
		"d3d230df-ee27-4c1b-aad5-fbf651bedd9b": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/workflow_receipt/DEALINFO.js",
			"id": "scripttask2",
			"name": "审批人信息处理"
		},
		"3e4d6abf-0f68-441c-ac58-03c36aca4179": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "收款单据${context.FLOW}审批",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://html5apps/receiptwf/ReceiptApproval/webapp/ReceiptApproval",
			"recipientUsers": "${context.approvalTree[\"node0020\"][\"subNode0010\"].account}",
			"userInterfaceParams": [{
				"key": "node",
				"value": "0020"
			}, {
				"key": "subnode",
				"value": "0010"
			}],
			"id": "usertask2",
			"name": "审批"
		},
		"e0f32322-3a1e-4c96-9ed4-055dd229b483": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway2",
			"name": "is Approved?",
			"default": "57ea6e3e-18df-4dd3-b718-7fa546d817ad"
		},
		"f0038233-670a-4b0d-a695-95300a326b8a": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "收款单据${context.FLOW}审批",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://html5apps/receiptwf/ReceiptSubmit/webapp/ReceiptSubmit",
			"recipientUsers": "${context.APPLICANT}",
			"userInterfaceParams": [{
				"key": "node",
				"value": "0040"
			}, {
				"key": "subnode",
				"value": "0010"
			}],
			"id": "usertask3",
			"name": "录入收款信息"
		},
		"fb23f0cb-cdf2-47c1-8b03-0897e79299bd": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "收款单据${context.FLOW}打印",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://html5apps/receiptwf/ReceiptApproval/webapp/ReceiptApproval",
			"recipientUsers": "${context.APPLICANT}",
			"userInterfaceParams": [{
				"key": "node",
				"value": "0030"
			}, {
				"key": "subnode",
				"value": "0010"
			}],
			"id": "usertask4",
			"name": "应收会计打印"
		},
		"404c3e30-0ec2-4fdd-9d1a-5c79d3e0beb8": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/workflow_receipt/Print.js",
			"id": "scripttask3",
			"name": "打印"
		},
		"d9a12c2e-20b1-49c7-92da-1ac043e79a7b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "a98512ca-dd16-489b-8887-43126d07397b",
			"targetRef": "9679c958-db35-4e90-b739-44f0404cac27"
		},
		"2adff7ba-efd7-45b4-a833-6b6aa233b147": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow2",
			"name": "SequenceFlow2",
			"sourceRef": "9679c958-db35-4e90-b739-44f0404cac27",
			"targetRef": "47dfea46-41d9-41d0-a393-e6d4374f83bb"
		},
		"8baa8047-9bc9-4e0c-a777-0cd39275c4cf": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "47dfea46-41d9-41d0-a393-e6d4374f83bb",
			"targetRef": "5d82eea7-f5f7-44ee-8582-280004537416"
		},
		"aff279a5-135a-4332-a208-444aa4cd8917": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "5d82eea7-f5f7-44ee-8582-280004537416",
			"targetRef": "3ddd6d54-44b6-4576-881f-7dbe39622b40"
		},
		"9675916e-4611-443a-ae28-511e91fcddb3": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "YES",
			"sourceRef": "3ddd6d54-44b6-4576-881f-7dbe39622b40",
			"targetRef": "404c3e30-0ec2-4fdd-9d1a-5c79d3e0beb8"
		},
		"109c12f1-04af-464b-bda4-36f59b421554": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow6",
			"name": "SequenceFlow6",
			"sourceRef": "b2d74a6d-7277-4055-92b0-c5668f33014b",
			"targetRef": "d3d230df-ee27-4c1b-aad5-fbf651bedd9b"
		},
		"48da7233-cd42-4455-a0a2-accc89eb98e7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.approved==false}",
			"id": "sequenceflow7",
			"name": "NO",
			"sourceRef": "3ddd6d54-44b6-4576-881f-7dbe39622b40",
			"targetRef": "f0038233-670a-4b0d-a695-95300a326b8a"
		},
		"a8508958-d7b1-4b5e-9463-6a2b1e9367cc": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow8",
			"name": "SequenceFlow8",
			"sourceRef": "d3d230df-ee27-4c1b-aad5-fbf651bedd9b",
			"targetRef": "3e4d6abf-0f68-441c-ac58-03c36aca4179"
		},
		"e24e41bf-3bca-4d17-848d-d262be16cd33": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "SequenceFlow9",
			"sourceRef": "3e4d6abf-0f68-441c-ac58-03c36aca4179",
			"targetRef": "e0f32322-3a1e-4c96-9ed4-055dd229b483"
		},
		"57ea6e3e-18df-4dd3-b718-7fa546d817ad": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow10",
			"name": "YES",
			"sourceRef": "e0f32322-3a1e-4c96-9ed4-055dd229b483",
			"targetRef": "08690bd6-5e65-4729-b3e0-41a018682146"
		},
		"b9837bc7-1e26-4fb9-9aab-1d67e2628ccd": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.approved==false}",
			"id": "sequenceflow11",
			"name": "NO",
			"sourceRef": "e0f32322-3a1e-4c96-9ed4-055dd229b483",
			"targetRef": "f0038233-670a-4b0d-a695-95300a326b8a"
		},
		"ad0ce294-d000-447c-bb7c-38100e64c7ec": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow12",
			"name": "SequenceFlow12",
			"sourceRef": "f0038233-670a-4b0d-a695-95300a326b8a",
			"targetRef": "9679c958-db35-4e90-b739-44f0404cac27"
		},
		"b80534f6-9d6a-4efe-a7c4-ecb21696cbb9": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow14",
			"name": "SequenceFlow14",
			"sourceRef": "404c3e30-0ec2-4fdd-9d1a-5c79d3e0beb8",
			"targetRef": "fb23f0cb-cdf2-47c1-8b03-0897e79299bd"
		},
		"a99a1c70-286b-412d-9cc9-60f776ff0b2d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow15",
			"name": "SequenceFlow15",
			"sourceRef": "fb23f0cb-cdf2-47c1-8b03-0897e79299bd",
			"targetRef": "b2d74a6d-7277-4055-92b0-c5668f33014b"
		},
		"967a0a93-e1fe-4ba4-9512-61de9381007e": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"c1ff1a18-2f29-4816-a59a-ac69c9d52a60": {},
				"3391c92b-67cd-4122-add9-a179267c1505": {},
				"218d3024-13ae-4dbb-86f1-ee4e0fe52a94": {},
				"2ae236ba-9d31-4f63-8549-d0da29e2dba6": {},
				"b8fa6947-ecd9-46af-93a2-e216a4733b7b": {},
				"f72d768b-a811-455f-add2-9bc945a796d4": {},
				"48824de9-fd6d-42de-948f-e4afb5a8372b": {},
				"87dea6b3-6b27-4ccc-89bb-3406270744f2": {},
				"96d08a4c-4cff-4029-905f-94bdc637a28d": {},
				"04921ed5-d467-428c-8b64-a5a7a495ed91": {},
				"2b04f056-c512-493d-b860-a5830b23083c": {},
				"77320f43-3289-42a5-b8f0-21667cb1389e": {},
				"33ddc2f8-f786-481a-9851-c1f112e66c7b": {},
				"5d6e04f1-24c0-402c-9edb-ed86a1a2e29e": {},
				"6b8295a8-dfc2-4312-9cf7-371ec14ada4b": {},
				"c66aca67-8e96-48ea-ae46-11c7347d6668": {},
				"107805b8-9b8a-470a-8e0a-bf568099f322": {},
				"5d324c4f-7952-4fa2-a227-1356c467c177": {},
				"6270ed6b-e7bb-4701-b6d5-a35d7245a1d8": {},
				"1af46671-60fe-4c23-ae8b-43d6404a0e6f": {},
				"762738b4-5b7e-44cf-9b56-8ee1a3cd5eac": {},
				"fd021e1e-b891-451f-94b9-926d46161540": {},
				"a8ed4edf-a92a-43bc-a1f5-620954e0b53a": {},
				"d935843a-0fd4-4cef-afd7-46bd0365ef43": {},
				"24d2a15c-aaeb-409a-b1b3-5d176b4197b7": {},
				"7616fe9b-be43-446d-8855-40383cca342d": {},
				"5baa0789-9a7f-4576-b744-d58a297562ed": {}
			}
		},
		"c1ff1a18-2f29-4816-a59a-ac69c9d52a60": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 12,
			"y": 43.999999701976776,
			"width": 32,
			"height": 32,
			"object": "a98512ca-dd16-489b-8887-43126d07397b"
		},
		"3391c92b-67cd-4122-add9-a179267c1505": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 1236.9999964237213,
			"y": 44.499999701976776,
			"width": 35,
			"height": 35,
			"object": "08690bd6-5e65-4729-b3e0-41a018682146"
		},
		"218d3024-13ae-4dbb-86f1-ee4e0fe52a94": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "44,59.999999701976776 94,59.999999701976776",
			"sourceSymbol": "c1ff1a18-2f29-4816-a59a-ac69c9d52a60",
			"targetSymbol": "2ae236ba-9d31-4f63-8549-d0da29e2dba6",
			"object": "d9a12c2e-20b1-49c7-92da-1ac043e79a7b"
		},
		"2ae236ba-9d31-4f63-8549-d0da29e2dba6": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 94,
			"y": 29.999999701976776,
			"width": 100,
			"height": 60,
			"object": "9679c958-db35-4e90-b739-44f0404cac27"
		},
		"b8fa6947-ecd9-46af-93a2-e216a4733b7b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "194,59.999999701976776 244,59.999999701976776",
			"sourceSymbol": "2ae236ba-9d31-4f63-8549-d0da29e2dba6",
			"targetSymbol": "f72d768b-a811-455f-add2-9bc945a796d4",
			"object": "2adff7ba-efd7-45b4-a833-6b6aa233b147"
		},
		"f72d768b-a811-455f-add2-9bc945a796d4": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 244,
			"y": 29.999999701976776,
			"width": 100,
			"height": 60,
			"object": "47dfea46-41d9-41d0-a393-e6d4374f83bb"
		},
		"48824de9-fd6d-42de-948f-e4afb5a8372b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "344,59.999999701976776 394,59.999999701976776",
			"sourceSymbol": "f72d768b-a811-455f-add2-9bc945a796d4",
			"targetSymbol": "87dea6b3-6b27-4ccc-89bb-3406270744f2",
			"object": "8baa8047-9bc9-4e0c-a777-0cd39275c4cf"
		},
		"87dea6b3-6b27-4ccc-89bb-3406270744f2": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 394,
			"y": 29.999999701976776,
			"width": 100,
			"height": 60,
			"object": "5d82eea7-f5f7-44ee-8582-280004537416"
		},
		"96d08a4c-4cff-4029-905f-94bdc637a28d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "494,59.999999701976776 544,59.999999701976776",
			"sourceSymbol": "87dea6b3-6b27-4ccc-89bb-3406270744f2",
			"targetSymbol": "04921ed5-d467-428c-8b64-a5a7a495ed91",
			"object": "aff279a5-135a-4332-a208-444aa4cd8917"
		},
		"04921ed5-d467-428c-8b64-a5a7a495ed91": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 544,
			"y": 38.999999701976776,
			"object": "3ddd6d54-44b6-4576-881f-7dbe39622b40"
		},
		"2b04f056-c512-493d-b860-a5830b23083c": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "586,59.999999701976776 586,123.5 596,123.5 595.9999988079071,170.99999940395355",
			"sourceSymbol": "04921ed5-d467-428c-8b64-a5a7a495ed91",
			"targetSymbol": "24d2a15c-aaeb-409a-b1b3-5d176b4197b7",
			"object": "9675916e-4611-443a-ae28-511e91fcddb3"
		},
		"77320f43-3289-42a5-b8f0-21667cb1389e": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 657.9999988079071,
			"y": 29.999999403953552,
			"width": 100,
			"height": 60,
			"object": "b2d74a6d-7277-4055-92b0-c5668f33014b"
		},
		"33ddc2f8-f786-481a-9851-c1f112e66c7b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "757.9999988079071,59.99999940395355 807.9999988079071,59.99999940395355",
			"sourceSymbol": "77320f43-3289-42a5-b8f0-21667cb1389e",
			"targetSymbol": "6b8295a8-dfc2-4312-9cf7-371ec14ada4b",
			"object": "109c12f1-04af-464b-bda4-36f59b421554"
		},
		"5d6e04f1-24c0-402c-9edb-ed86a1a2e29e": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "569.0000023291661,60.00000111873329 568.9999987528874,-134.99999917928994",
			"sourceSymbol": "04921ed5-d467-428c-8b64-a5a7a495ed91",
			"targetSymbol": "fd021e1e-b891-451f-94b9-926d46161540",
			"object": "48da7233-cd42-4455-a0a2-accc89eb98e7"
		},
		"6b8295a8-dfc2-4312-9cf7-371ec14ada4b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 807.9999988079071,
			"y": 29.999999403953552,
			"width": 100,
			"height": 60,
			"object": "d3d230df-ee27-4c1b-aad5-fbf651bedd9b"
		},
		"c66aca67-8e96-48ea-ae46-11c7347d6668": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "907.9999988079071,59.99999940395355 955.9999988079071,59.99999940395355",
			"sourceSymbol": "6b8295a8-dfc2-4312-9cf7-371ec14ada4b",
			"targetSymbol": "107805b8-9b8a-470a-8e0a-bf568099f322",
			"object": "a8508958-d7b1-4b5e-9463-6a2b1e9367cc"
		},
		"107805b8-9b8a-470a-8e0a-bf568099f322": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 955.9999988079071,
			"y": 29.999999403953552,
			"width": 100,
			"height": 60,
			"object": "3e4d6abf-0f68-441c-ac58-03c36aca4179"
		},
		"5d324c4f-7952-4fa2-a227-1356c467c177": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1055.999998807907,59.99999940395355 1125.9999976158142,59.99999940395355",
			"sourceSymbol": "107805b8-9b8a-470a-8e0a-bf568099f322",
			"targetSymbol": "6270ed6b-e7bb-4701-b6d5-a35d7245a1d8",
			"object": "e24e41bf-3bca-4d17-848d-d262be16cd33"
		},
		"6270ed6b-e7bb-4701-b6d5-a35d7245a1d8": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 1125.9999976158142,
			"y": 38.99999940395355,
			"object": "e0f32322-3a1e-4c96-9ed4-055dd229b483"
		},
		"1af46671-60fe-4c23-ae8b-43d6404a0e6f": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1167.9999976158142,63.499999701976776 1236.9999964237213,63.499999701976776",
			"sourceSymbol": "6270ed6b-e7bb-4701-b6d5-a35d7245a1d8",
			"targetSymbol": "3391c92b-67cd-4122-add9-a179267c1505",
			"object": "57ea6e3e-18df-4dd3-b718-7fa546d817ad"
		},
		"762738b4-5b7e-44cf-9b56-8ee1a3cd5eac": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "1167.9999976158142,59.99999940395355 1218,60 1218,-164 635.5,-164",
			"sourceSymbol": "6270ed6b-e7bb-4701-b6d5-a35d7245a1d8",
			"targetSymbol": "fd021e1e-b891-451f-94b9-926d46161540",
			"object": "b9837bc7-1e26-4fb9-9aab-1d67e2628ccd"
		},
		"fd021e1e-b891-451f-94b9-926d46161540": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 536,
			"y": -194,
			"width": 100,
			"height": 60,
			"object": "f0038233-670a-4b0d-a695-95300a326b8a"
		},
		"a8ed4edf-a92a-43bc-a1f5-620954e0b53a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "586,-164 128,-164 128,30.499999701976776",
			"sourceSymbol": "fd021e1e-b891-451f-94b9-926d46161540",
			"targetSymbol": "2ae236ba-9d31-4f63-8549-d0da29e2dba6",
			"object": "ad0ce294-d000-447c-bb7c-38100e64c7ec"
		},
		"d935843a-0fd4-4cef-afd7-46bd0365ef43": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 722,
			"y": 166,
			"width": 100,
			"height": 60,
			"object": "fb23f0cb-cdf2-47c1-8b03-0897e79299bd"
		},
		"24d2a15c-aaeb-409a-b1b3-5d176b4197b7": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 536,
			"y": 166,
			"width": 100,
			"height": 60,
			"object": "404c3e30-0ec2-4fdd-9d1a-5c79d3e0beb8"
		},
		"7616fe9b-be43-446d-8855-40383cca342d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "586,196 747,196",
			"sourceSymbol": "24d2a15c-aaeb-409a-b1b3-5d176b4197b7",
			"targetSymbol": "d935843a-0fd4-4cef-afd7-46bd0365ef43",
			"object": "b80534f6-9d6a-4efe-a7c4-ecb21696cbb9"
		},
		"5baa0789-9a7f-4576-b744-d58a297562ed": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "772,196 772,127.75 711,127.75 711,65",
			"sourceSymbol": "d935843a-0fd4-4cef-afd7-46bd0365ef43",
			"targetSymbol": "77320f43-3289-42a5-b8f0-21667cb1389e",
			"object": "a99a1c70-286b-412d-9cc9-60f776ff0b2d"
		},
		"e42fad05-4f32-4ff3-9e5c-7efa0079067f": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"sequenceflow": 15,
			"startevent": 1,
			"endevent": 1,
			"usertask": 4,
			"servicetask": 2,
			"scripttask": 3,
			"exclusivegateway": 2
		}
	}
}