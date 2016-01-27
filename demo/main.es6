import ComponentView from "../index";
let breadth = 10;
let depth = 10;

const NestedView = ComponentView.extend({
  render() {
    let tabs = "";
    for (let i = 0; i < depth; i++) {
      tabs += " ";
    }
    this.$el.append(`<pre>${tabs}${breadth}-${depth}</pre>`);
    if (depth-- > 0) {
      this.$el.append(`<div class='view-${breadth}-${depth}'>`);
      this.assign({
        [`.view-${breadth}-${depth}`]: new NestedView()
      });
    }
    return this;
  }
});

const AppView = ComponentView.extend({
  el: "body",
  events: {
    "click #openBtn": "openAll",
    "click #closeBtn": "closeSubViews"
  },
  render() {
    return this;
  },
  openAll() {
    while (breadth-- > 0) {
      this.$el.append(`<div class='view-${breadth}'>`);
      this.assign({
        [`.view-${breadth}`]: new NestedView()
      });
      depth = 10;
    }
  },
  onClose() {
    breadth = 10;
    depth = 10;
    return this;
  }
});

window.app = new AppView();
window.app.render();
