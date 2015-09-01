// Let's build a highlighted text sharing tool!
function HighlightShare(options) {
  const opts = options || {};
  const classes = opts.classNames || {};
  const config = this.config = {
    url: opts.url || window.location.href, // URL to share
    hashtags: opts.hashtags || '', // Hashtags (for Twitter)
    related: opts.related || 'jlengstorf', // Related accounts (for Twitter)
    via: opts.via || '', // Article author (for Twitter)
    classNames: {
      wrapper: classes.wrapper || 'highlight-share__share-box',
      active: classes.active || 'highlight-share__is-active',
      tweetBtn: classes.tweetBtn || 'highlight-share__share-btn--twitter',
    },
    container: opts.container || 'body',
    appendTo: 'body', // Query selector (see: http://mzl.la/1AYePlN)
  };
  const shareBox = document.createElement('div');
  const tweetBtn = document.createElement('button');
  let container;

  // For saving the selection
  this.savedText = false;

  // So we can avoid collisions
  this.isActive = false;

  // Twitter button attributes and content
  tweetBtn.className = config.classNames.tweetBtn;

  // Share box attributes
  shareBox.className = config.classNames.wrapper;
  shareBox.appendChild(tweetBtn);

  // Adds a click handler for sharing quotes
  shareBox.addEventListener('click', this.handleButtonClick.bind(this));

  // Sets the container for restricting functionality to just one section
  this.container = document.querySelector(this.config.container);

  // Appends the sharing box to the DOM
  document.querySelector(config.appendTo).appendChild(shareBox);

  // Listens for mouseup as a signal that text selection may have occurred
  document.addEventListener('mouseup', this.handleSelection.bind(this));
}

HighlightShare.prototype = Object.create({
  constructor: {
    value: HighlightShare,
  },
});

HighlightShare.prototype.getSelectedText = function() {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      return selection.getRangeAt(0);
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }

  return false;
};

HighlightShare.prototype.restoreSelectedText = function(range) {
  if (range) {
    if (window.getSelection) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.selection && range.select) {
      range.select();
    }
  }
};

HighlightShare.prototype.handleSelection = function(event) {
  this.savedText = this.getSelectedText();

  if (this.isInContainer(event.target)) {
    setTimeout(this.showSharingBox.bind(this), 100, event);
  }
};

HighlightShare.prototype.showSharingBox = function(event) {
  const isEmpty = this.savedText.toString().length === 0;
  const wrapper = this.getWrapper();
  const ignoredTags = ['a', 'img', 'button', 'input', 'select'];
  const targetTag = event.target.tagName.toLowerCase();

  if (!isEmpty && !this.isActive && ignoredTags.indexOf(targetTag) === -1) {
    this.isActive = true;
    wrapper.style.left = event.pageX + 'px';
    wrapper.style.top = event.pageY + 'px';
    wrapper.className += ' ' + this.config.classNames.active;
  } else {
    this.hideSharingBox();
  }
};

HighlightShare.prototype.handleButtonClick = function(event) {
  if (!this.savedText) {
    return;
  }

  if (event.target.className.indexOf(this.config.classNames.tweetBtn) !== -1) {
    window.open(
      this.buildTwitterUrl(),
      'sharing-window',
      'width=600, height=400, top=200, left=300'
    );
  }

  this.restoreSelectedText(this.savedText);
};

HighlightShare.prototype.hideSharingBox = function() {
  const wrapper = this.getWrapper();
  const updatedClass = wrapper.className.replace(this.config.classNames.active, '');

  wrapper.style.left = '';
  wrapper.style.top = '';
  wrapper.className = updatedClass;

  // Make sure a new box can be opened
  this.isActive = false;
};

HighlightShare.prototype.buildTwitterUrl = function() {
  const url = 'https://twitter.com/intent/tweet';
  const properties = {
    text: this.savedText,
    url: this.config.url || '',
    hashtags: this.config.hashtags || '',
    related: this.config.related || '',
    via: this.config.via || '',
  };
  let queryString = '';

  for (let prop in properties) {
    if (properties[prop].toString().length > 0) {
      queryString += queryString.length === 0 ? '?' : '&';
      queryString += prop + '=' + properties[prop];
    }
  }

  return url + queryString;
};

HighlightShare.prototype.getWrapper = function() {
  return document.getElementsByClassName(this.config.classNames.wrapper)[0];
};

HighlightShare.prototype.isInContainer = function(node) {
  if (this.container === null) {
    return false;
  }

  return this.container === node ? false : this.container.contains(node);
};
