

class Node {
  constructor(value, next)
  {
    this.value=value
    this.next=next ?? null
  }

  copy() {
    return new Node(this.value, this.next);
  }
}

export class LinkedList {
  constructor() {
    this.head = null;
  }

  append(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let currentNode = this.head;
    while (currentNode.next) {
      currentNode = currentNode.next;
    }

    currentNode.next = newNode;
  }

  static fromArray(data) {
    const linkedList = new LinkedList();
    data.forEach((node) => {
      linkedList.append(node);
    })

    return linkedList;
  }

  static fromNode(node) {
    const linkedList = new LinkedList();
    if (!node || !node.value) {
      return linkedList;
    }

    let copiedNode = node.copy();
    while (copiedNode.next) {
      linkedList.append(copiedNode.value);
      copiedNode = copiedNode.next;
    }

    if (!!copiedNode?.value) {
      linkedList.append(copiedNode.value);
    }

    return linkedList;
  }

  toArrayList() {
    let currentNode = this.head;
    const array = [];
    while (currentNode?.next) {
      array.push(currentNode);
      currentNode = currentNode.next;
    }

    if (!!currentNode?.value) {
      array.push(currentNode);
    }

    return array;
  }

  toArray() {
    let currentNode = this.head;
    const array = [];
    while (currentNode?.next) {
      array.push(currentNode.value);
      currentNode = currentNode.next;
    }

    return array;
  }
}