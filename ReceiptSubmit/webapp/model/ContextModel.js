sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	/* globals Promise */

	return {

		/**
		 * Reads the process context from REST API
		 */
		readContext: function (oComponent, taskId) {
			// set the UI to busy
			oComponent.setBusy(true);

			var promise = new Promise(function (resolve, reject) {
				$.ajax({
					url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context",
					method: "GET",
					contentType: "application/json",
					dataType: "json",
					success: function (result, xhr, data) {
						// resolve with the process context as result
						resolve(data.responseJSON);
					},
					error: function (xhr, textStatus, errorText) {
						reject(Error(errorText));
					}
				});
			});

			// the method returns a promise!
			return promise;
		},

		/**
		 * Triggers the completion of the task via REST API
		 */
		triggerComplete: function (taskId, stage, oContext) {
			var promise = new Promise(function (resolve, reject) {
				$.ajax({
					url: "/bpmworkflowruntime/rest/v1/xsrf-token",
					method: "GET",
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					success: function (result, xhr, data) {
						var token = data.getResponseHeader("X-CSRF-Token");

						// after receiving the token, call the task completion REST API
						$.ajax({
							url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
							method: "PATCH",
							contentType: "application/json",
							data: "{\"status\":\"COMPLETED\",\"stage\":\"" + stage + "\",\"context\":" + JSON.stringify(oContext) + "}",
							headers: {
								"X-CSRF-Token": token
							},
							success: function (result, xhr, data) {
								resolve(data);
							},
							error: function (xhr, textStatus, errorText) {
								reject(Error(errorText));
							}
						});
					},
					error: function (xhr, textStatus, errorText) {
						reject(Error(errorText));
					}
				});
			});

			return promise;
		}
	};
});