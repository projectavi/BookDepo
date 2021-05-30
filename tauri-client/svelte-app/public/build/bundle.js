
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (51:2) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Search!";
    			attr_dev(button, "id", "button");
    			attr_dev(button, "class", "svelte-1qzpb6e");
    			add_location(button, file, 51, 3, 1326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleSearch*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(51:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#if FLAG_done === "searching"}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Searching...";
    			attr_dev(button, "id", "button");
    			attr_dev(button, "class", "svelte-1qzpb6e");
    			add_location(button, file, 49, 3, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleSearch*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(49:2) {#if FLAG_done === \\\"searching\\\"}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if FLAG_done !== "searching"}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*results*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 4) {
    				each_value = /*results*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:2) {#if FLAG_done !== \\\"searching\\\"}",
    		ctx
    	});

    	return block;
    }

    // (60:3) {#each results as result}
    function create_each_block(ctx) {
    	let div;
    	let a;
    	let h4;
    	let t0_value = /*result*/ ctx[8].title + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(h4, file, 60, 64, 1574);
    			attr_dev(a, "href", a_href_value = /*result*/ ctx[8].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1qzpb6e");
    			add_location(a, file, 60, 25, 1535);
    			attr_dev(div, "class", "result svelte-1qzpb6e");
    			add_location(div, file, 60, 4, 1514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 4 && t0_value !== (t0_value = /*result*/ ctx[8].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*results*/ 4 && a_href_value !== (a_href_value = /*result*/ ctx[8].link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(60:3) {#each results as result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let link0;
    	let t0;
    	let div0;
    	let h2;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let div2;
    	let div1;
    	let form;
    	let p0;
    	let input0;
    	let t5;
    	let label0;
    	let t7;
    	let p1;
    	let input1;
    	let t8;
    	let input2;
    	let t9;
    	let label1;
    	let t11;
    	let link1;
    	let t12;
    	let br2;
    	let t13;
    	let t14;
    	let br3;
    	let t15;
    	let article;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*FLAG_done*/ ctx[3] === "searching") return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*FLAG_done*/ ctx[3] !== "searching" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			link0 = element("link");
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Book Depo";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			form = element("form");
    			p0 = element("p");
    			input0 = element("input");
    			t5 = space();
    			label0 = element("label");
    			label0.textContent = "Book Name";
    			t7 = space();
    			p1 = element("p");
    			input1 = element("input");
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			label1 = element("label");
    			label1.textContent = "Number of Results";
    			t11 = space();
    			link1 = element("link");
    			t12 = space();
    			br2 = element("br");
    			t13 = space();
    			if_block0.c();
    			t14 = space();
    			br3 = element("br");
    			t15 = space();
    			article = element("article");
    			if (if_block1) if_block1.c();
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Open+Sans:300i,400");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file, 23, 1, 533);
    			attr_dev(h2, "class", "svelte-1qzpb6e");
    			add_location(h2, file, 25, 2, 647);
    			attr_dev(div0, "class", "titles svelte-1qzpb6e");
    			add_location(div0, file, 24, 1, 624);
    			add_location(br0, file, 28, 1, 676);
    			add_location(br1, file, 29, 1, 684);
    			attr_dev(input0, "class", "w3-input");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file, 37, 5, 793);
    			add_location(label0, file, 38, 5, 858);
    			add_location(p0, file, 36, 5, 784);
    			attr_dev(input1, "class", "w3-input");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "2");
    			attr_dev(input1, "max", "10");
    			add_location(input1, file, 40, 5, 906);
    			attr_dev(input2, "class", "w3-input");
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "2");
    			attr_dev(input2, "max", "10");
    			add_location(input2, file, 41, 5, 988);
    			add_location(label1, file, 42, 5, 1069);
    			add_location(p1, file, 39, 5, 892);
    			attr_dev(form, "class", "w3-container");
    			add_location(form, file, 35, 3, 751);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://www.w3schools.com/w3css/4/w3.css");
    			add_location(link1, file, 44, 3, 1120);
    			attr_dev(div1, "class", "w3-card-4");
    			add_location(div1, file, 33, 2, 721);
    			add_location(br2, file, 47, 2, 1204);
    			attr_dev(div2, "class", "input-grid svelte-1qzpb6e");
    			add_location(div2, file, 31, 1, 693);
    			add_location(br3, file, 55, 1, 1405);
    			attr_dev(article, "class", "grid container svelte-1qzpb6e");
    			add_location(article, file, 57, 1, 1414);
    			attr_dev(main, "class", "svelte-1qzpb6e");
    			add_location(main, file, 22, 0, 525);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, link0);
    			append_dev(main, t0);
    			append_dev(main, div0);
    			append_dev(div0, h2);
    			append_dev(main, t2);
    			append_dev(main, br0);
    			append_dev(main, t3);
    			append_dev(main, br1);
    			append_dev(main, t4);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, form);
    			append_dev(form, p0);
    			append_dev(p0, input0);
    			set_input_value(input0, /*book_name*/ ctx[0]);
    			append_dev(p0, t5);
    			append_dev(p0, label0);
    			append_dev(form, t7);
    			append_dev(form, p1);
    			append_dev(p1, input1);
    			set_input_value(input1, /*num_results*/ ctx[1]);
    			append_dev(p1, t8);
    			append_dev(p1, input2);
    			set_input_value(input2, /*num_results*/ ctx[1]);
    			append_dev(p1, t9);
    			append_dev(p1, label1);
    			append_dev(div1, t11);
    			append_dev(div1, link1);
    			append_dev(div2, t12);
    			append_dev(div2, br2);
    			append_dev(div2, t13);
    			if_block0.m(div2, null);
    			append_dev(main, t14);
    			append_dev(main, br3);
    			append_dev(main, t15);
    			append_dev(main, article);
    			if (if_block1) if_block1.m(article, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*book_name*/ 1 && input0.value !== /*book_name*/ ctx[0]) {
    				set_input_value(input0, /*book_name*/ ctx[0]);
    			}

    			if (dirty & /*num_results*/ 2 && to_number(input1.value) !== /*num_results*/ ctx[1]) {
    				set_input_value(input1, /*num_results*/ ctx[1]);
    			}

    			if (dirty & /*num_results*/ 2) {
    				set_input_value(input2, /*num_results*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, null);
    				}
    			}

    			if (/*FLAG_done*/ ctx[3] !== "searching") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(article, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let book_name = "";
    	let num_results = "";
    	let results = [];
    	let FLAG_done = "none";

    	async function handleSearch(e) {
    		// let data = {search: book_name, num: num_results}
    		$$invalidate(3, FLAG_done = "searching");

    		try {
    			const returnValue = await fetch(`/search?term=${JSON.stringify({ search: book_name, num: num_results })}`);
    			const response = await returnValue.json();
    			$$invalidate(2, results = response.data);
    			$$invalidate(3, FLAG_done = "found");
    			console.log(results);
    		} catch(error) {
    			console.error("error", error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		book_name = this.value;
    		$$invalidate(0, book_name);
    	}

    	function input1_input_handler() {
    		num_results = to_number(this.value);
    		$$invalidate(1, num_results);
    	}

    	function input2_change_input_handler() {
    		num_results = to_number(this.value);
    		$$invalidate(1, num_results);
    	}

    	$$self.$capture_state = () => ({
    		book_name,
    		num_results,
    		results,
    		FLAG_done,
    		handleSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ("book_name" in $$props) $$invalidate(0, book_name = $$props.book_name);
    		if ("num_results" in $$props) $$invalidate(1, num_results = $$props.num_results);
    		if ("results" in $$props) $$invalidate(2, results = $$props.results);
    		if ("FLAG_done" in $$props) $$invalidate(3, FLAG_done = $$props.FLAG_done);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		book_name,
    		num_results,
    		results,
    		FLAG_done,
    		handleSearch,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
