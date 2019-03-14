// For an introduction to the Blank template, see the following documentation:
// https://go.microsoft.com/fwlink/?LinkId=232509

(function () {
	"use strict";

  var app = WinJS.Application;
  var Credentials = Windows.Security.Credentials;
    var activation = Windows.ApplicationModel.Activation;
    var enumeration = Windows.Devices.Enumeration;
    var bt = Windows.Devices.Bluetooth;
    var isFirstActivation = true;

    console.log('Starting up');
	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			// TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
			// this is a good place to decide whether to populate an input field or choose a different initial view.
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			// A Launch activation happens when the user launches your app via the tile
			// or invokes a toast notification by clicking or tapping on the body.
			if (args.detail.arguments) {
				// TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
				// to take the user in response to them invoking a toast notification.
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				// TODO: This application had been suspended and was then terminated to reclaim memory.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
				// Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
			}
		}

		if (!args.detail.prelaunchActivated) {
			// TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
			// In that case it would be suspended shortly thereafter.
			// Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
			// should be done here (to avoid doing them in the prelaunch case).
			// Alternatively, this work can be done in a resume or visibilitychanged handler.
		}

		if (isFirstActivation) {
			// TODO: The app was activated and had not been running. Do general startup initialization here.
			document.addEventListener("visibilitychange", onVisibilityChanged);
			args.setPromise(WinJS.UI.processAll());
		}

        isFirstActivation = false;

        start();
	};

	function onVisibilityChanged(args) {
		if (!document.hidden) {
			// TODO: The app just became visible. This may be a good time to refresh the view.
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	app.start();

  async function start() {
    document.getElementById('login').addEventListener('click', (e) => {
      getAuthToken();
    })
        var additionalProperties = [ "System.Devices.Aep.DeviceAddress", "System.Devices.Aep.IsConnected", "System.Devices.Aep.IsPresent", "System.Devices.Aep.Bluetooth.Le.IsConnectable" ];

        // BT_Code: Example showing paired and non-paired in a single query.
        var aqsFilter = "(System.Devices.Aep.ProtocolId:=\"{bb7bb05e-5972-42b5-94fc-76eaa7084d49}\")";
        var watcher = enumeration.DeviceInformation.createWatcher(aqsFilter, additionalProperties, enumeration.DeviceInformationKind.associationEndpoint);
        watcher.onadded = (device) => {
            console.log('Added device', device.name, device.kind);
        }
        watcher.onremoved = (device) => {
            console.log('Removed device', device.name, device.kind);
        }
        watcher.onupdated = (device) => {
            console.log('Updated device', device.name, device.id, device.kind);
        }
        watcher.onenumerationcompleted = () => {
            console.log('Enumeration completed');
        }
        //watcher.start();

        const status = await Windows.Devices.Geolocation.Geolocator.requestAccessAsync();
        switch (status) {
            case Windows.Devices.Geolocation.GeolocationAccessStatus.allowed:
                var geolocator = new Windows.Devices.Geolocation.Geolocator();
                geolocator.onstatuschanged = (status) => {
                    console.log('Location changed', status);
                }
                const position = await geolocator.getGeopositionAsync();//.then((position) => {
                console.log('Current pos', position);
                //});
                break;
            default:
                console.log('Unable to get access to geolocation services', status);
      }

      await isAuthAvailable();
    }

  async function isAuthAvailable() {
     const isSupported = await Credentials.KeyCredentialManager.isSupportedAsync();
     onsole.log('Is KeyCredentialManager supported?', isSupported);
  }

  async function getAuthToken() {
    const result = await Credentials.KeyCredentialManager.requestCreateAsync("user", Credentials.KeyCredentialCreationOption.replaceExisting);
    console.log('Got auth token result', result);
    const key = await Credentials.KeyCredentialManager.openAsync("user");
    console.log('Got auth key', key);
    const publicKey = key.credential.retrievePublicKey();
    console.log('Got public key', publicKey);
    const publicKeyBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(publicKey);
    console.log('Got public key base64', publicKeyBase64);
  }
})();
