const View = require("backbone").View;
const _ = require("lodash");

// sub views are stored within this weakmap
// which is keyed on each instance
const subViewStore = new WeakMap;

// memory conscious Backbone view component.
// each sub-view within this component
// is 'assigned' to the context of this view
// so that it's state in memory can be monitored.
//
// when this view is closed, each sub-view will
// also be closed in turn and their dom elements
// destroyed, allowing for sure garbage collection
const ComponentView = View.extend({
  // assign a subView to a selector found within
  // this view. Eg;
  //
  //   this.assign('foo', new View());
  //   this.assign({
  //     foo: new View1(),
  //     bar: new View2()
  //   });
  assign(selector, view, options) {
    let selectors;

    if (_.isObject(selector)) {
      selectors = selector;
    } else {
      selectors = {};
      selectors[selector] = view;
    }

    if (selectors) {
      _.each(selectors, (v, s) => {
        console.group("open: %s %s", v.cid, s);
        this._assignView(v, s, options);
        console.groupEnd();
      });
    }
    return this;
  },

  // close a sub-view found within this view
  closeSubView(subView) {
    const view = this._getSubView(subView);
    if (view.close) {
      view.close();
    }
    this._deleteSubView(view);
    return this;
  },

  // close all sub-views within this view
  closeSubViews() {
    _.each(this._getSubViews(), subView => this.closeSubView(subView));
    return this;
  },

  // close this view.
  // 1. `onBeforeClose` is triggered
  // 2. `onClose` function called TODO allow view onClose method to
  //     prevent closure? Akin to Java memory management
  // 3. sub-views are closed in turn
  // 4. event listeners on this view are destroyed
  // 5. this views DOM element is emptied and it's references destroyed
  // 6. `onClose` event is triggered
  close() {
    if (this._isClosed) {
      console.debug("Attempt to close view that was already closed.", this);
      return this;
    }
    console.group("close: %s %s", this.cid, this._selector);
    this.trigger("onBeforeClose", this);
    if (this.onClose) {
      this.onClose();
    }
    this.closeSubViews();

    this.stopListening();
    this.undelegateEvents();

    this.$el.empty();
    delete this.$el;
    delete this.el;
    subViewStore.delete(this);

    this._isClosed = true;
    this.trigger("onClose", this);
    console.groupEnd();
    return this;
  },

  // internal function
  _assignView(assignView, selector, options) {
    const view = assignView;
    // if another view is already rendered here then close it
    // and delete the reference
    if (this._hasSubView(selector)) {
      this.closeSubView(selector);
    }

    view.setElement(this.$(selector));
    if (!options || !options.noRender) {
      this.trigger("onBeforeRender", this);
      view._isClosed = false;
      view.render();
      this.trigger("onRender", this);
    }
    view._selector = selector;

    const subViews = subViewStore.get(this);
    subViews[selector] = view;
    subViewStore.get(this, subViews);
    return this;
  },

  _deleteSubView(subView) {
    const view = this._getSubView(subView);
    const subViews = subViewStore.get(this);
    delete subViews[view._selector];
    subViewStore.set(this, subViews);
    return this;
  },

  _hasSubView(subView) {
    const view = this._getSubView(subView);
    if (!view) {
      return false;
    }
    const subViews = subViewStore.get(this);
    return !!subViews[view._selector];
  },

  _getSubView(subView) {
    let view = subView;
    if (typeof view === "string") {
      view = this._getSubViews()[view];
    }
    return view;
  },

  _getSubViews() {
    let subViews = subViewStore.get(this);
    if (!subViews) {
      subViews = {};
      subViewStore.set(this, subViews);
    }
    return subViews;
  }

});

if (localStorage.getItem("memory_profile")) {
  setInterval(() => {
    if (localStorage.getItem("memory_profile")) {
      console.debug(`[memory_profile] current views in memory: ${subViewStore.length}`);
      console.debug(subViewStore);
    }
  }, 5000);
}

module.exports = ComponentView;