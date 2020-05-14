sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ReceiptApproval.controller.App", {

		onInit: function () {},

		formatDate: function (v) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				style: "medium"
			}, sap.ui.getCore().getConfiguration().getLocale());
			return oDateFormat.format(v);
		},
		getMediaUrl: function (sUrl) {
			// if (oContext.getProperty("media_src")) {
			// 	return oContext.getProperty("media_src");
			// } else {
			// 	return "null";
			// }
			if (sUrl) {
				var url = new URL(sUrl);
				var start = url.href.indexOf(url.origin);
				// var sPath = url.href.substring(start, start + url.origin.length);
				var sPath = url.href.substring(start + url.origin.length, url.href.length);
				return sPath.replace("/sap/opu/odata/sap", "/html5apps/ecrapproval/destinations/WT_S4HC");

			} else {
				return "";
			}
		}
	});
});