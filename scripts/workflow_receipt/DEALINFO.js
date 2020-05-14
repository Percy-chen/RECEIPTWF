/*
// read from existing workflow context 
var productInfo = $.context.productInfo; 
var productName = productInfo.productName; 
var productDescription = productInfo.productDescription;

// read contextual information
var taskDefinitionId = $.info.taskDefinitionId;

// read user task information
var lastUserTask1 = $.usertasks.usertask1.last;
var userTaskSubject = lastUserTask1.subject;
var userTaskProcessor = lastUserTask1.processor;
var userTaskCompletedAt = lastUserTask1.completedAt;

var userTaskStatusMessage = " User task '" + userTaskSubject + "' has been completed by " + userTaskProcessor + " at " + userTaskCompletedAt;

// create new node 'product'
var product = {
		productDetails: productName  + " " + productDescription,
		workflowStep: taskDefinitionId
};

// write 'product' node to workflow context
$.context.product = product;
*/
// 获取审批人账号
$.context.workflowInstanceId = $.info.workflowInstanceId;
$.context.workflowDefinitionId = $.info.workflowDefinitionId;
var approvalTree = {};

//填写Node ID
var ApprovalNode = $.context.User.d.results;

for (var i = 0; i < ApprovalNode.length; i++) {
	var NodeProperty = "node" + ApprovalNode[i].NODEID;
	var SubNodeProperty = "subNode" + ApprovalNode[i].SUBNODEID;
	if (!approvalTree.hasOwnProperty(NodeProperty)) {
		approvalTree[NodeProperty] = {};
	}

	if (!approvalTree[NodeProperty].hasOwnProperty(SubNodeProperty)) {
		approvalTree[NodeProperty][SubNodeProperty] = {
			account: []
		};
	}
	approvalTree[NodeProperty][SubNodeProperty].account.push(ApprovalNode[i].APPROVALACCOUNT);
}
// $.context.ApprovalNode = {};
$.context.approvalTree = approvalTree;
$.context.Print = "";