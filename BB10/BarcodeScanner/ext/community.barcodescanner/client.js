/*
* Copyright 2013 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var _self = {},
	_ID = require("./manifest.json").namespace;

	_self.startRead = function (codeFound, errorFound, canvasID, successStart) {
		if ( typeof(successStart) == "function" ) {
			window.webworks.event.once(_ID, "community.barcodescanner.started", successStart);
		}
		if ( canvasID !== null ) {
			canvas = document.getElementById(canvasID);
			window.webworks.event.add(_ID, "community.barcodescanner.frameavailable", frameAvailable);
		}
		if ( typeof(errorFound) == "function" ) {
			window.webworks.event.once(_ID, "community.barcodescanner.errorfound", errorFound);
		}
		if ( typeof(codeFound) == "function" ) {
			window.webworks.event.once(_ID, "community.barcodescanner.codefound", codeFound);
		}
		blackberry.io.sandbox = false;
		return window.webworks.execAsync(_ID, "startRead", null);
	};

	_self.stopRead = function (codeFound, errorFound, canvasID, successfulEnd) {
		if ( typeof(errorFound) == "function" ) {
			window.webworks.event.once(_ID, "community.barcodescanner.errorfound", errorFound);
		}
		if ( typeof(successfulEnd) == "function" ) {
			window.webworks.event.once(_ID, "community.barcodescanner.ended", successfulEnd);
		}
		if ( canvasID !== null ) {
			window.webworks.event.remove(_ID, "community.barcodescanner.frameavailable", frameAvailable);
		}
		if ( typeof(codeFound) == "function" ) {
			window.webworks.event.remove(_ID, "community.barcodescanner.codefound", codeFound);
		}
		return window.webworks.execAsync(_ID, "stopRead", null);
	};

	var canvas, timeout, fs, latestFrame = null;

	function readFile(filename) {
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

		window.requestFileSystem(window.TEMPORARY, 1024 * 1024,
			function (fs) {
				fs.root.getFile(filename, {create: false},
					function (fileEntry) {
						fileEntry.file(function (file) {
							var reader = new FileReader();
							reader.onloadend = function (e) {
								var ctx = canvas.getContext("2d");
								var img = new Image();
								img.onload = function() {
									ctx.drawImage(img, 0, 0);
									URL.revokeObjectURL(img.src);
									img.src = null;
								};
								img.src = e.target.result;
							};

							reader.readAsDataURL(file);
						}, errorHandler);
					}, errorHandler);
				});
	}

	function errorHandler(e) {
		var msg = '';

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
			case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
			case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
			case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
			case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
			default:
			msg = 'Unknown Error';
			break;
		}

		console.log(msg);
	}

	function frameAvailable(data){
		latestFrame = data.frame;
		timeout = setTimeout(readFile, 4, latestFrame);
	}

module.exports = _self;
