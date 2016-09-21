# backbone.assign

A micro library for creating memory conciencious Backbone views.

# Reasoning 

In long-lived, single page web-apps, the importance of maintaining a zero memory footprint is high. Although performing various cleanup operations,vanilla Backbone does not allow for views to easily manage the state of their sub-views. This makes it difficult to ensure that when views are destroyed they efficiently and completely cleanup all event handlers and elements they have created and delegated.

# Installation 

    npm install backbone.assign

# Usage

Backbone.assign is provided as an ES6 module;

    import ParentView from "backbone.assign";

Using Backbone.assign, sub-views are assigned to a child element, and then rendered implicitly. This allows backbone.assign and the parent view to manage the state of all of it's sub-views. An example view assignment may be as follows;

    const PageView = ParentView.extend({
        initialize(options) {
            // create a view
            this.listView = new ListView();
        },
        render() {
            // render and append the view
            // to the .list element
            this.assign({
                '.list': this.listView
            });
        }
    });

# Assumptions

In order for backbone.assign to work effectively without intervention, two asumptionns are made;

1. **All events will be delegated from the root element of the view.**
   This can be achieved by using the `events` object exclusively, or by delegating events from `this.el`.
2. **The `render` function will not alter the view's root element.**   

# Events

| Event Name        | Description   |
| ------------------|---------------| 
| `onBeforeRender`  | called immediately before the view is rendered |
| `onRender`        | called immediately after the view is rendered  |
| `onBeforeClose`   | called immediately before the view is closed   |
| `onClose`         | called immediately after the view is closed    |

# Additional cleanup

To perform any additional cleanup of memory an `onClose` method is exposed. The `onClose` function will be called after the `onBeforeClose` event, but before memory cleanup. This 

### Preventing final cleanup

Returning `false` from the `onClose` function will rekindle the view, preventing cleanup from being finalized. 

# Drawbacks

# License