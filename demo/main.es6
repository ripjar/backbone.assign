import ComponentView from "../index";
const breadth = 10;
let depth = 10;

const NestedView = ComponentView.extend({
  render() {
    this.$el.text(depth);
    if (depth-- > 0) {
      this.$el.append(`<div class='view-${depth}'>`);
      this.assign({
        [`.view-${depth}`]: new NestedView()
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
    for (let i = breadth; i > 0; i--) {
      this.$el.append(`<div class='view-${i}'>`);
      this.assign({
        [`.view-${i}`]: new NestedView()
      });
      depth = 10;
    }
  }

});

window.app = new AppView();
window.app.render();