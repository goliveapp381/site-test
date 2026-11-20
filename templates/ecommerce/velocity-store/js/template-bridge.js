'use strict';

/*
=========================================================
TEMPLATECRAFT PRO
VELOCITY STORE
UNIVERSAL TEMPLATE BRIDGE
=========================================================
*/

(function () {

    const TemplateBridge = {

        templateId: 'velocity-store',

        version: '1.0.0',


        init() {

            TemplateBridge.bindMessages();

            TemplateBridge.notifyReady();

        },


        bindMessages() {

            window.addEventListener(
                'message',
                function (event) {

                    const data = event.data;

                    if (
                        !data ||
                        typeof data !== 'object'
                    ) {
                        return;
                    }


                    switch (data.type) {

                        case 'SET_VALUE':

                            TemplateBridge.setValue(
                                data.key,
                                data.value
                            );

                            break;


                        case 'SET_STYLE':

                            TemplateBridge.setStyle(
                                data.key,
                                data.property,
                                data.value
                            );

                            break;


                        case 'SET_IMAGE':

                            TemplateBridge.setImage(
                                data.key,
                                data.value
                            );

                            break;


                        case 'GET_VALUE':

                            TemplateBridge.sendValue(
                                data.key
                            );

                            break;

                    }

                }
            );

        },


        setValue(key, value) {

            if (!key) {
                return;
            }


            const elements =
                document.querySelectorAll(
                    `[data-editable="${key}"]`
                );


            if (!elements.length) {
                return;
            }


            elements.forEach(function (element) {

                if (
                    element.tagName === 'INPUT' ||
                    element.tagName === 'TEXTAREA' ||
                    element.tagName === 'SELECT'
                ) {

                    element.value =
                        value ?? '';

                    element.dispatchEvent(
                        new Event(
                            'input',
                            {
                                bubbles: true
                            }
                        )
                    );

                    element.dispatchEvent(
                        new Event(
                            'change',
                            {
                                bubbles: true
                            }
                        )
                    );

                    return;
                }


                element.textContent =
                    value ?? '';

            });

        },


        setStyle(
            key,
            property,
            value
        ) {

            if (
                !key ||
                !property
            ) {
                return;
            }


            const elements =
                document.querySelectorAll(
                    `[data-editable="${key}"]`
                );


            elements.forEach(function (element) {

                element.style.setProperty(
                    property,
                    value
                );

            });

        },


        setImage(
            key,
            value
        ) {

            if (!key || !value) {
                return;
            }


            const elements =
                document.querySelectorAll(
                    `[data-editable="${key}"]`
                );


            elements.forEach(function (element) {

                if (
                    element.tagName === 'IMG'
                ) {

                    element.src = value;

                    return;

                }


                element.style.backgroundImage =
                    `url("${value}")`;

            });

        },


        getValue(key) {

            const element =
                document.querySelector(
                    `[data-editable="${key}"]`
                );


            if (!element) {
                return null;
            }


            if (
                element.tagName === 'INPUT' ||
                element.tagName === 'TEXTAREA' ||
                element.tagName === 'SELECT'
            ) {

                return element.value;

            }


            return element.textContent.trim();

        },


        sendValue(key) {

            const value =
                TemplateBridge.getValue(key);


            if (
                window.parent === window
            ) {
                return;
            }


            window.parent.postMessage({

                type: 'VALUE_RESPONSE',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version,

                key: key,

                value: value

            }, '*');

        },


        notifyReady() {

            if (
                window.parent === window
            ) {
                return;
            }


            window.parent.postMessage({

                type: 'TEMPLATE_READY',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version

            }, '*');

        }

    };


    window.VelocityTemplateBridge =
        TemplateBridge;


    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            TemplateBridge.init
        );

    } else {

        TemplateBridge.init();

    }

})();
