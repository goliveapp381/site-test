'use strict';

/*
=========================================================
TEMPLATECRAFT PRO
VELOCITY STORE
UNIVERSAL TEMPLATE BRIDGE
---------------------------------------------------------
Responsibilities:

- Connect template with Universal Editor
- Detect data-editable fields
- Generate TEMPLATE_SCHEMA
- Support text
- Support images
- Support links
- Support attributes
- Support styles
- Support structured data
- Support products
- Return current values
- Apply editor customizations
- Save state locally inside template runtime
=========================================================
*/

(function () {

    const TemplateBridge = {

        /* =====================================================
           TEMPLATE ID
        ===================================================== */

        templateId: 'velocity-store',

        version: '1.0.0',


        /* =====================================================
           STATE
        ===================================================== */

        initialized: false,

        schema: [],

        values: {},

        products: [],


        /* =====================================================
           INIT
        ===================================================== */

        init() {

            if (
                TemplateBridge.initialized
            ) {
                return;
            }


            TemplateBridge.initialized =
                true;


            TemplateBridge.collectSchema();

            TemplateBridge.loadSavedState();

            TemplateBridge.bindMessages();

            TemplateBridge.bindEditableEvents();

            TemplateBridge.notifyReady();

            TemplateBridge.sendSchema();

        },


        /* =====================================================
           MESSAGE LISTENER
        ===================================================== */

        bindMessages() {

            window.addEventListener(
                'message',
                function (event) {

                    const data =
                        event.data;


                    if (
                        !data ||
                        typeof data !== 'object'
                    ) {
                        return;
                    }


                    switch (
                        data.type
                    ) {

                        /* -------------------------------------
                           SET VALUE
                        ------------------------------------- */

                        case 'SET_VALUE':

                            TemplateBridge.setValue(
                                data.key,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET STYLE
                        ------------------------------------- */

                        case 'SET_STYLE':

                            TemplateBridge.setStyle(
                                data.key,
                                data.property,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET IMAGE
                        ------------------------------------- */

                        case 'SET_IMAGE':

                            TemplateBridge.setImage(
                                data.key,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET ATTRIBUTE
                        ------------------------------------- */

                        case 'SET_ATTRIBUTE':

                            TemplateBridge.setAttribute(
                                data.key,
                                data.attribute,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET DATA
                        ------------------------------------- */

                        case 'SET_DATA':

                            TemplateBridge.setData(
                                data.key,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET PRODUCT
                        ------------------------------------- */

                        case 'SET_PRODUCT':

                            TemplateBridge.setProduct(
                                data.productId,
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           SET PRODUCTS
                        ------------------------------------- */

                        case 'SET_PRODUCTS':

                            TemplateBridge.setProducts(
                                data.value
                            );

                            break;


                        /* -------------------------------------
                           GET VALUE
                        ------------------------------------- */

                        case 'GET_VALUE':

                            TemplateBridge.sendValue(
                                data.key
                            );

                            break;


                        /* -------------------------------------
                           GET SCHEMA
                        ------------------------------------- */

                        case 'GET_SCHEMA':

                        case 'GET_TEMPLATE_SCHEMA':

                        case 'GET_EDITABLES':

                            TemplateBridge.sendSchema();

                            break;


                        /* -------------------------------------
                           SAVE STATE
                        ------------------------------------- */

                        case 'SAVE_STATE':

                            TemplateBridge.saveState(
                                data.values
                            );

                            break;


                        /* -------------------------------------
                           GET STATE
                        ------------------------------------- */

                        case 'GET_STATE':

                            TemplateBridge.sendState();

                            break;


                        /* -------------------------------------
                           SET STATE
                        ------------------------------------- */

                        case 'SET_STATE':

                            TemplateBridge.loadState(
                                data.values
                            );

                            break;


                        /* -------------------------------------
                           GET PRODUCTS
                        ------------------------------------- */

                        case 'GET_PRODUCTS':

                            TemplateBridge.sendProducts();

                            break;


                        /* -------------------------------------
                           RESET
                        ------------------------------------- */

                        case 'RESET_TEMPLATE':

                            TemplateBridge.reset();

                            break;

                    }

                }
            );

        },


        /* =====================================================
           COLLECT SCHEMA
        ===================================================== */

        collectSchema() {

            const elements =
                document.querySelectorAll(
                    '[data-editable]'
                );


            const schema = [];

            const seen =
                new Set();


            elements.forEach(
                function (element) {

                    const key =
                        element.getAttribute(
                            'data-editable'
                        );


                    if (!key) {
                        return;
                    }


                    /*
                       Prevent duplicate schema entries.
                    */

                    if (
                        seen.has(key)
                    ) {
                        return;
                    }


                    seen.add(key);


                    const field =
                        TemplateBridge.createFieldSchema(
                            element,
                            key
                        );


                    schema.push(
                        field
                    );

                }
            );


            TemplateBridge.schema =
                schema;


            /*
               Detect products separately.
            */

            TemplateBridge.collectProducts();

        },


        /* =====================================================
           CREATE FIELD SCHEMA
        ===================================================== */

        createFieldSchema(
            element,
            key
        ) {

            const type =
                TemplateBridge.detectType(
                    element
                );


            const attribute =
                TemplateBridge.detectAttribute(
                    element
                );


            const group =
                element.getAttribute(
                    'data-editable-group'
                ) ||
                TemplateBridge.detectGroup(
                    key
                );


            const label =
                element.getAttribute(
                    'data-editable-label'
                ) ||
                element.getAttribute(
                    'aria-label'
                ) ||
                TemplateBridge.humanize(
                    key
                );


            const value =
                TemplateBridge.getElementValue(
                    element
                );


            const property =
                element.getAttribute(
                    'data-editable-property'
                ) ||
                null;


            const description =
                element.getAttribute(
                    'data-editable-description'
                ) ||
                '';


            const placeholder =
                element.getAttribute(
                    'placeholder'
                ) ||
                '';


            let options = [];


            if (
                element.tagName === 'SELECT'
            ) {

                options =
                    Array.from(
                        element.options
                    ).map(
                        function (option) {

                            return {

                                value:
                                    option.value,

                                label:
                                    option.textContent

                            };

                        }
                    );

            }


            return {

                key: key,

                id: key,

                label: label,

                type: type,

                tag:
                    element.tagName,

                attribute:
                    attribute,

                property:
                    property,

                group:
                    group,

                description:
                    description,

                placeholder:
                    placeholder,

                value:
                    value,

                options:
                    options,

                editable: true,

                multiple:
                    TemplateBridge.hasMultipleElements(
                        key
                    )

            };

        },


        /* =====================================================
           DETECT TYPE
        ===================================================== */

        detectType(
            element
        ) {

            const explicit =
                element.getAttribute(
                    'data-editable-type'
                );


            if (explicit) {

                return explicit.toLowerCase();

            }


            const tag =
                element.tagName;


            if (
                tag === 'IMG'
            ) {

                return 'image';

            }


            if (
                tag === 'TEXTAREA'
            ) {

                return 'textarea';

            }


            if (
                tag === 'SELECT'
            ) {

                return 'select';

            }


            if (
                tag === 'INPUT'
            ) {

                const inputType =
                    (
                        element.type ||
                        'text'
                    ).toLowerCase();


                if (
                    inputType === 'checkbox'
                ) {

                    return 'boolean';

                }


                if (
                    inputType === 'number'
                ) {

                    return 'number';

                }


                if (
                    inputType === 'color'
                ) {

                    return 'color';

                }


                if (
                    inputType === 'url'
                ) {

                    return 'url';

                }


                return 'text';

            }


            /*
               Background image.
            */

            const style =
                window.getComputedStyle(
                    element
                );


            if (
                style.backgroundImage &&
                style.backgroundImage !==
                'none'
            ) {

                return 'image';

            }


            /*
               URL fields.
            */

            if (
                element.hasAttribute(
                    'href'
                )
            ) {

                return 'url';

            }


            return 'text';

        },


        /* =====================================================
           DETECT ATTRIBUTE
        ===================================================== */

        detectAttribute(
            element
        ) {

            const explicit =
                element.getAttribute(
                    'data-editable-attribute'
                );


            if (explicit) {

                return explicit;

            }


            if (
                element.tagName === 'IMG'
            ) {

                return 'src';

            }


            if (
                element.hasAttribute(
                    'href'
                )
            ) {

                return 'href';

            }


            if (
                element.hasAttribute(
                    'placeholder'
                )
            ) {

                return 'placeholder';

            }


            return null;

        },


        /* =====================================================
           DETECT GROUP
        ===================================================== */

        detectGroup(
            key
        ) {

            const value =
                String(
                    key || ''
                ).toLowerCase();


            if (
                value.includes(
                    'announcement'
                )
            ) {
                return 'announcement';
            }


            if (
                value.includes(
                    'brand'
                ) ||
                value.includes(
                    'logo'
                )
            ) {
                return 'brand';
            }


            if (
                value.includes(
                    'nav'
                ) ||
                value.includes(
                    'menu'
                )
            ) {
                return 'navigation';
            }


            if (
                value.includes(
                    'hero'
                )
            ) {
                return 'hero';
            }


            if (
                value.includes(
                    'category'
                )
            ) {
                return 'categories';
            }


            if (
                value.includes(
                    'product'
                )
            ) {
                return 'products';
            }


            if (
                value.includes(
                    'sale'
                )
            ) {
                return 'sale';
            }


            if (
                value.includes(
                    'trend'
                )
            ) {
                return 'trending';
            }


            if (
                value.includes(
                    'newsletter'
                )
            ) {
                return 'newsletter';
            }


            if (
                value.includes(
                    'footer'
                )
            ) {
                return 'footer';
            }


            if (
                value.includes(
                    'color'
                ) ||
                value.includes(
                    'font'
                ) ||
                value.includes(
                    'appearance'
                )
            ) {
                return 'appearance';
            }


            return 'general';

        },


        /* =====================================================
           HAS MULTIPLE
        ===================================================== */

        hasMultipleElements(
            key
        ) {

            return (
                document.querySelectorAll(
                    `[data-editable="${TemplateBridge.escapeSelectorValue(key)}"]`
                ).length > 1
            );

        },


        /* =====================================================
           GET VALUE
        ===================================================== */

        getValue(
            key
        ) {

            if (!key) {
                return null;
            }


            const element =
                TemplateBridge.findElement(
                    key
                );


            if (!element) {

                return (
                    TemplateBridge.values[key] ??
                    null
                );

            }


            return TemplateBridge.getElementValue(
                element
            );

        },


        /* =====================================================
           GET ELEMENT VALUE
        ===================================================== */

        getElementValue(
            element
        ) {

            if (
                element.tagName === 'INPUT' ||
                element.tagName === 'TEXTAREA' ||
                element.tagName === 'SELECT'
            ) {

                if (
                    element.type ===
                    'checkbox'
                ) {

                    return Boolean(
                        element.checked
                    );

                }


                return element.value;

            }


            if (
                element.tagName === 'IMG'
            ) {

                return (
                    element.getAttribute(
                        'src'
                    ) ||
                    ''
                );

            }


            const attribute =
                element.getAttribute(
                    'data-editable-attribute'
                );


            if (
                attribute
            ) {

                return (
                    element.getAttribute(
                        attribute
                    ) ||
                    ''
                );

            }


            return (
                element.textContent ||
                ''
            ).trim();

        },


        /* =====================================================
           SET VALUE
        ===================================================== */

        setValue(
            key,
            value
        ) {

            if (!key) {
                return;
            }


            const elements =
                TemplateBridge.findElements(
                    key
                );


            if (!elements.length) {

                TemplateBridge.values[key] =
                    value;

                return;

            }


            elements.forEach(
                function (element) {

                    if (
                        element.tagName ===
                        'INPUT' ||
                        element.tagName ===
                        'TEXTAREA' ||
                        element.tagName ===
                        'SELECT'
                    ) {

                        if (
                            element.type ===
                            'checkbox'
                        ) {

                            element.checked =
                                Boolean(
                                    value
                                );

                        } else {

                            element.value =
                                value ?? '';

                        }


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


                    /*
                       If field points to a special
                       attribute, update it.
                    */

                    const attribute =
                        element.getAttribute(
                            'data-editable-attribute'
                        );


                    if (
                        attribute &&
                        attribute !== 'textContent'
                    ) {

                        element.setAttribute(
                            attribute,
                            value ?? ''
                        );


                        return;

                    }


                    /*
                       Normal text.
                    */

                    element.textContent =
                        value ?? '';

                }
            );


            TemplateBridge.values[key] =
                value;


            TemplateBridge.notifyChanged(
                key,
                value
            );

        },


        /* =====================================================
           SET ATTRIBUTE
        ===================================================== */

        setAttribute(
            key,
            attribute,
            value
        ) {

            if (
                !key ||
                !attribute
            ) {
                return;
            }


            const elements =
                TemplateBridge.findElements(
                    key
                );


            elements.forEach(
                function (element) {

                    if (
                        attribute ===
                        'textContent'
                    ) {

                        element.textContent =
                            value ?? '';

                        return;

                    }


                    if (
                        attribute ===
                        'innerHTML'
                    ) {

                        /*
                           We intentionally don't allow
                           arbitrary HTML injection here.
                        */

                        element.textContent =
                            value ?? '';

                        return;

                    }


                    element.setAttribute(
                        attribute,
                        value ?? ''
                    );

                }
            );


            TemplateBridge.values[key] =
                value;


            TemplateBridge.notifyChanged(
                key,
                value
            );

        },


        /* =====================================================
           SET STYLE
        ===================================================== */

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
                TemplateBridge.findElements(
                    key
                );


            elements.forEach(
                function (element) {

                    element.style.setProperty(
                        property,
                        value ?? ''
                    );

                }
            );


            /*
               Save style customization separately.
            */

            if (
                !TemplateBridge.values.__styles
            ) {

                TemplateBridge.values.__styles =
                    {};

            }


            if (
                !TemplateBridge.values
                    .__styles[key]
            ) {

                TemplateBridge.values
                    .__styles[key] =
                    {};

            }


            TemplateBridge.values
                .__styles[key][property] =
                value;


            TemplateBridge.notifyChanged(
                key,
                value
            );

        },


        /* =====================================================
           SET IMAGE
        ===================================================== */

        setImage(
            key,
            value
        ) {

            if (!key) {
                return;
            }


            const elements =
                TemplateBridge.findElements(
                    key
                );


            elements.forEach(
                function (element) {

                    if (
                        element.tagName ===
                        'IMG'
                    ) {

                        element.src =
                            value ?? '';


                        /*
                           Keep src attribute synchronized.
                        */

                        element.setAttribute(
                            'src',
                            value ?? ''
                        );


                        return;

                    }


                    /*
                       Background image.
                    */

                    if (
                        value
                    ) {

                        element.style.backgroundImage =
                            `url("${TemplateBridge.escapeCssUrl(value)}")`;

                    } else {

                        element.style.backgroundImage =
                            '';

                    }

                }
            );


            TemplateBridge.values[key] =
                value;


            TemplateBridge.notifyChanged(
                key,
                value
            );

        },


        /* =====================================================
           SET DATA
        ===================================================== */

        setData(
            key,
            value
        ) {

            if (!key) {
                return;
            }


            TemplateBridge.values[key] =
                value;


            /*
               Special structured content.
            */

            if (
                key === 'products'
            ) {

                TemplateBridge.setProducts(
                    value
                );

                return;

            }


            TemplateBridge.notifyChanged(
                key,
                value
            );

        },


        /* =====================================================
           SEND VALUE
        ===================================================== */

        sendValue(
            key
        ) {

            if (
                window.parent === window
            ) {
                return;
            }


            const value =
                TemplateBridge.getValue(
                    key
                );


            TemplateBridge.postToParent({

                type:
                    'VALUE_RESPONSE',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version,

                key:
                    key,

                value:
                    value

            });

        },


        /* =====================================================
           SEND SCHEMA
        ===================================================== */

        sendSchema() {

            if (
                window.parent === window
            ) {
                return;
            }


            /*
               Rebuild before sending.
            */

            TemplateBridge.collectSchema();


            TemplateBridge.postToParent({

                type:
                    'TEMPLATE_SCHEMA',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version,

                schema:
                    TemplateBridge.schema,

                products:
                    TemplateBridge.products

            });

        },


        /* =====================================================
           NOTIFY READY
        ===================================================== */

        notifyReady() {

            if (
                window.parent === window
            ) {
                return;
            }


            TemplateBridge.postToParent({

                type:
                    'TEMPLATE_READY',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version

            });


            /*
               Compatibility with old editor.
            */

            TemplateBridge.postToParent({

                type:
                    'BRIDGE_READY',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version

            });

        },


        /* =====================================================
           NOTIFY CHANGED
        ===================================================== */

        notifyChanged(
            key,
            value
        ) {

            TemplateBridge.postToParent({

                type:
                    'EDITOR_STATE',

                templateId:
                    TemplateBridge.templateId,

                key:
                    key,

                value:
                    value,

                dirty:
                    true

            });

        },


        /* =====================================================
           POST TO PARENT
        ===================================================== */

        postToParent(
            data
        ) {

            if (
                window.parent === window
            ) {
                return;
            }


            try {

                window.parent.postMessage(
                    data,
                    '*'
                );

            } catch (error) {

                console.error(
                    '[TemplateBridge] postMessage error:',
                    error
                );

            }

        },


        /* =====================================================
           FIND ELEMENT
        ===================================================== */

        findElement(
            key
        ) {

            return (
                document.querySelector(
                    `[data-editable="${TemplateBridge.escapeSelectorValue(key)}"]`
                )
            );

        },


        /* =====================================================
           FIND ELEMENTS
        ===================================================== */

        findElements(
            key
        ) {

            return Array.from(
                document.querySelectorAll(
                    `[data-editable="${TemplateBridge.escapeSelectorValue(key)}"]`
                )
            );

        },


        /* =====================================================
           PRODUCTS
        ===================================================== */

        collectProducts() {

            const productElements =
                document.querySelectorAll(
                    '[data-product-id]'
                );


            const products = [];

            const seen =
                new Set();


            productElements.forEach(
                function (element) {

                    const productId =
                        element.getAttribute(
                            'data-product-id'
                        );


                    if (!productId) {
                        return;
                    }


                    if (
                        seen.has(productId)
                    ) {
                        return;
                    }


                    seen.add(
                        productId
                    );


                    const product = {

                        id:
                            productId,

                        name:
                            TemplateBridge.readProductField(
                                productId,
                                'name'
                            ),

                        price:
                            TemplateBridge.readProductField(
                                productId,
                                'price'
                            ),

                        image:
                            TemplateBridge.readProductField(
                                productId,
                                'image'
                            ),

                        description:
                            TemplateBridge.readProductField(
                                productId,
                                'description'
                            ),

                        category:
                            TemplateBridge.readProductField(
                                productId,
                                'category'
                            )

                    };


                    products.push(
                        product
                    );

                }
            );


            TemplateBridge.products =
                products;


            return products;

        },


        /* =====================================================
           READ PRODUCT FIELD
        ===================================================== */

        readProductField(
            productId,
            field
        ) {

            const selector =
                `[data-product-id="${TemplateBridge.escapeSelectorValue(productId)}"] ` +
                `[data-product-field="${TemplateBridge.escapeSelectorValue(field)}"]`;


            const element =
                document.querySelector(
                    selector
                );


            if (!element) {
                return '';
            }


            return TemplateBridge.getElementValue(
                element
            );

        },


        /* =====================================================
           SET PRODUCT
        ===================================================== */

        setProduct(
            productId,
            data
        ) {

            if (
                !productId ||
                !data ||
                typeof data !== 'object'
            ) {
                return;
            }


            const productElements =
                document.querySelectorAll(
                    `[data-product-id="${TemplateBridge.escapeSelectorValue(productId)}"]`
                );


            productElements.forEach(
                function (productElement) {

                    Object.keys(
                        data
                    ).forEach(
                        function (field) {

                            const selector =
                                `[data-product-field="${TemplateBridge.escapeSelectorValue(field)}"]`;


                            const element =
                                productElement.querySelector(
                                    selector
                                );


                            if (!element) {
                                return;
                            }


                            if (
                                field === 'image' &&
                                element.tagName ===
                                'IMG'
                            ) {

                                element.src =
                                    data[field] ??
                                    '';

                                return;

                            }


                            if (
                                element.tagName ===
                                'INPUT' ||
                                element.tagName ===
                                'TEXTAREA'
                            ) {

                                element.value =
                                    data[field] ??
                                    '';

                            } else {

                                element.textContent =
                                    data[field] ??
                                    '';

                            }

                        }
                    );

                }
            );


            const existingIndex =
                TemplateBridge.products.findIndex(
                    function (product) {

                        return (
                            product.id ===
                            productId
                        );

                    }
                );


            if (
                existingIndex !== -1
            ) {

                TemplateBridge.products[
                    existingIndex
                ] = {

                    ...TemplateBridge.products[
                        existingIndex
                    ],

                    ...data

                };

            } else {

                TemplateBridge.products.push({

                    id:
                        productId,

                    ...data

                });

            }


            TemplateBridge.values.products =
                TemplateBridge.products;


            TemplateBridge.notifyChanged(
                'products',
                TemplateBridge.products
            );

        },


        /* =====================================================
           SET PRODUCTS
        ===================================================== */

        setProducts(
            products
        ) {

            if (
                !Array.isArray(products)
            ) {
                return;
            }


            products.forEach(
                function (product) {

                    if (
                        !product ||
                        !product.id
                    ) {
                        return;
                    }


                    TemplateBridge.setProduct(
                        product.id,
                        product
                    );

                }
            );


            TemplateBridge.products =
                TemplateBridge.collectProducts();


            TemplateBridge.values.products =
                TemplateBridge.products;

        },


        /* =====================================================
           SEND PRODUCTS
        ===================================================== */

        sendProducts() {

            TemplateBridge.collectProducts();


            TemplateBridge.postToParent({

                type:
                    'PRODUCTS_RESPONSE',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version,

                products:
                    TemplateBridge.products

            });

        },


        /* =====================================================
           SAVE STATE
        ===================================================== */

        saveState(
            values
        ) {

            if (
                values &&
                typeof values === 'object'
            ) {

                TemplateBridge.values =
                    TemplateBridge.mergeObjects(
                        TemplateBridge.values,
                        values
                    );

            }


            try {

                localStorage.setItem(

                    TemplateBridge.storageKey(),

                    JSON.stringify(
                        TemplateBridge.values
                    )

                );

            } catch (error) {

                console.warn(
                    '[TemplateBridge] localStorage save failed:',
                    error
                );

            }


            TemplateBridge.postToParent({

                type:
                    'SAVE_RESPONSE',

                success:
                    true,

                templateId:
                    TemplateBridge.templateId

            });

        },


        /* =====================================================
           LOAD SAVED STATE
        ===================================================== */

        loadSavedState() {

            try {

                const raw =
                    localStorage.getItem(
                        TemplateBridge.storageKey()
                    );


                if (!raw) {
                    return;
                }


                const state =
                    JSON.parse(
                        raw
                    );


                if (
                    !state ||
                    typeof state !== 'object'
                ) {
                    return;
                }


                TemplateBridge.values =
                    TemplateBridge.mergeObjects(
                        TemplateBridge.values,
                        state
                    );


                /*
                   Apply simple saved values.
                */

                Object.keys(
                    state
                ).forEach(
                    function (key) {

                        if (
                            key === '__styles' ||
                            key === 'products'
                        ) {
                            return;
                        }


                        TemplateBridge.setValue(
                            key,
                            state[key]
                        );

                    }
                );


                /*
                   Apply saved styles.
                */

                if (
                    state.__styles
                ) {

                    Object.keys(
                        state.__styles
                    ).forEach(
                        function (key) {

                            const styles =
                                state.__styles[
                                    key
                                ];


                            if (
                                !styles ||
                                typeof styles !==
                                'object'
                            ) {
                                return;
                            }


                            Object.keys(
                                styles
                            ).forEach(
                                function (property) {

                                    TemplateBridge.setStyle(
                                        key,
                                        property,
                                        styles[property]
                                    );

                                }
                            );

                        }
                    );

                }


                /*
                   Apply products.
                */

                if (
                    Array.isArray(
                        state.products
                    )
                ) {

                    TemplateBridge.setProducts(
                        state.products
                    );

                }

            } catch (error) {

                console.warn(
                    '[TemplateBridge] Could not load saved state:',
                    error
                );

            }

        },


        /* =====================================================
           LOAD STATE
        ===================================================== */

        loadState(
            values
        ) {

            if (
                !values ||
                typeof values !== 'object'
            ) {
                return;
            }


            TemplateBridge.values =
                TemplateBridge.mergeObjects(
                    {},
                    values
                );


            Object.keys(
                values
            ).forEach(
                function (key) {

                    if (
                        key === '__styles' ||
                        key === 'products'
                    ) {
                        return;
                    }


                    TemplateBridge.setValue(
                        key,
                        values[key]
                    );

                }
            );


            if (
                values.__styles
            ) {

                Object.keys(
                    values.__styles
                ).forEach(
                    function (key) {

                        const styles =
                            values.__styles[
                                key
                            ];


                        Object.keys(
                            styles || {}
                        ).forEach(
                            function (property) {

                                TemplateBridge.setStyle(
                                    key,
                                    property,
                                    styles[property]
                                );

                            }
                        );

                    }
                );

            }


            if (
                Array.isArray(
                    values.products
                )
            ) {

                TemplateBridge.setProducts(
                    values.products
                );

            }

        },


        /* =====================================================
           SEND STATE
        ===================================================== */

        sendState() {

            TemplateBridge.postToParent({

                type:
                    'STATE_RESPONSE',

                templateId:
                    TemplateBridge.templateId,

                version:
                    TemplateBridge.version,

                values:
                    TemplateBridge.values

            });

        },


        /* =====================================================
           RESET
        ===================================================== */

        reset() {

            try {

                localStorage.removeItem(
                    TemplateBridge.storageKey()
                );

            } catch (error) {

                console.warn(
                    '[TemplateBridge] Reset failed:',
                    error
                );

            }


            window.location.reload();

        },


        /* =====================================================
           STORAGE KEY
        ===================================================== */

        storageKey() {

            return (
                `templatecraft:` +
                `${TemplateBridge.templateId}:state`
            );

        },


        /* =====================================================
           MERGE OBJECTS
        ===================================================== */

        mergeObjects(
            target,
            source
        ) {

            const result = {
                ...(target || {})
            };


            Object.keys(
                source || {}
            ).forEach(
                function (key) {

                    const value =
                        source[key];


                    if (
                        value &&
                        typeof value ===
                        'object' &&
                        !Array.isArray(
                            value
                        )
                    ) {

                        result[key] =
                            TemplateBridge.mergeObjects(
                                result[key] || {},
                                value
                            );

                    } else {

                        result[key] =
                            value;

                    }

                }
            );


            return result;

        },


        /* =====================================================
           BIND EDITABLE EVENTS
        ===================================================== */

        bindEditableEvents() {

            document.addEventListener(
                'input',
                function (event) {

                    const element =
                        event.target;


                    if (
                        !element ||
                        !element.matches(
                            '[data-editable]'
                        )
                    ) {
                        return;
                    }


                    const key =
                        element.getAttribute(
                            'data-editable'
                        );


                    if (!key) {
                        return;
                    }


                    const value =
                        TemplateBridge.getElementValue(
                            element
                        );


                    TemplateBridge.values[key] =
                        value;

                }
            );


            document.addEventListener(
                'change',
                function (event) {

                    const element =
                        event.target;


                    if (
                        !element ||
                        !element.matches(
                            '[data-editable]'
                        )
                    ) {
                        return;
                    }


                    const key =
                        element.getAttribute(
                            'data-editable'
                        );


                    if (!key) {
                        return;
                    }


                    const value =
                        TemplateBridge.getElementValue(
                            element
                        );


                    TemplateBridge.values[key] =
                        value;

                }
            );

        },


        /* =====================================================
           HUMANIZE
        ===================================================== */

        humanize(
            value
        ) {

            return String(
                value || ''
            )
            .replace(
                /[_-]+/g,
                ' '
            )
            .replace(
                /([a-z])([A-Z])/g,
                '$1 $2'
            )
            .replace(
                /\s+/g,
                ' '
            )
            .trim()
            .replace(
                /^./,
                function (character) {
                    return character.toUpperCase();
                }
            );

        },


        /* =====================================================
           ESCAPE SELECTOR
        ===================================================== */

        escapeSelectorValue(
            value
        ) {

            if (
                window.CSS &&
                typeof CSS.escape ===
                'function'
            ) {

                return CSS.escape(
                    String(value)
                );

            }


            return String(
                value
            )
            .replace(
                /\\/g,
                '\\\\'
            )
            .replace(
                /"/g,
                '\\"'
            );

        },


        /* =====================================================
           ESCAPE CSS URL
        ===================================================== */

        escapeCssUrl(
            value
        ) {

            return String(
                value || ''
            )
            .replace(
                /\\/g,
                '\\\\'
            )
            .replace(
                /"/g,
                '\\"'
            );

        }

    };


    /* =========================================================
       GLOBAL
    ========================================================= */

    window.TemplateBridge =
        TemplateBridge;


    /*
       Backward compatibility with
       previous Velocity name.
    */

    window.VelocityTemplateBridge =
        TemplateBridge;


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            function () {

                TemplateBridge.init();

            }
        );

    } else {

        TemplateBridge.init();

    }

})();
