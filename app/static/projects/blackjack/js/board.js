/**
 * @description Asynchronously delays execution by a specified number of milliseconds.
 * @param {number} milliseconds - The number of milliseconds to wait.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * @class Card
 * @description Represents a playing card with a suit, rank, and value.
 */
class Card {
  /**
   * @constructor
   * @param {string} suit - The suit of the card (e.g., "H", "D", "C", "S).
   * @param {string} rank - The rank of the card (e.g., "A", "2", "K").
   * @param {number} value - The numerical value of the card (e.g., 11 for Ace, 10 for face cards, 2-10 for number cards).
   * @param {number} cardNumber - The number of the card (e.g., 3, 6, 321).
   */
  constructor(suit, rank, value, cardNumber) {
    /**
     * @type {string}
     * @description The full name of the card, combining suit and rank (e.g., "HA" for Ace of Hearts).
     */
    this.name = suit + rank;

    /**
     * @type {number}
     * @description The numerical value of the card, used for scoring in games.
     */
    this.value = value;

    /**
     * @type {number}
     * @description The number of the card used for the card elements id attribute (e.g., 3, 6, 321).
     */
    this.cardNumber = cardNumber;
  }

  /**
   * @method createCard
   * @description Creates an HTML element representing the card with its front and back sides.
   * @returns {HTMLElement} - The HTML element representing the card.
   */
  createCard() {
    // Create the outer and inner elements
    const cardElement = document.createElement("div");
    cardElement.classList.add("shoe", "flip-card");
    cardElement.id = this.cardNumber;

    const innerElement = document.createElement("div");
    innerElement.id = this.name;
    innerElement.classList.add("flip-card-inner", "flip");

    // Create the front side
    const frontElement = document.createElement("div");
    frontElement.classList.add("flip-card-front");

    // Create the image and add it to the front side
    const frontImage = document.createElement("img");
    frontImage.src = `${staticImgPath}${this.name}.png`;
    frontElement.appendChild(frontImage);

    // Create the back side
    const backElement = document.createElement("div");
    backElement.classList.add("flip-card-back");

    // Create the image and add it to the back side
    const backImage = document.createElement("img");
    backImage.src = `${staticImgPath}card-back.png`;
    backElement.appendChild(backImage);

    // Add the front and back sides to the inner element
    innerElement.appendChild(frontElement);
    innerElement.appendChild(backElement);

    // Add the inner element to the outer element
    cardElement.appendChild(innerElement);

    // Return the created card element
    return cardElement;
  }

  /**
   * @method insertCard
   * @description Inserts the card element into the fourth position on the board.
   * @param {HTMLElement} cardElement - The HTML element representing the card to be inserted.
   */
  insertCard(cardElement) {
    // Selects the third element and inserts the cardElement parameter after it.
    document
      .getElementById("board-inner-container")
      .children[3].insertAdjacentElement("afterend", cardElement);
  }

  /**
   * @method rotateCard
   * @description Rotates the HTML element with the id of the cardNumber attribute.
   */
  rotateCard() {
    // Selects the first element inside the element with the id of the cardNumber attribute.
    document
      .getElementById(this.cardNumber)
      .children[0].classList.toggle("flip");
  }

  /**
   * @method dealCard
   * @description This function positions a card element on the game board at the specified coordinates.
   *              It removes the "shoe" class from the card and adjusts its zIndex.
   * @param {number[]} position - An array containing x and y coordinates. Example: [x, y]
   */
  dealCard(position) {
    // Select the fourth card element with class "shoe"
    const card = document.querySelectorAll(".shoe")[3];

    // Set the top and right positions of the card element
    card.style.top = position[0] + "px";
    card.style.right = position[1] + "px";

    // Remove the "shoe" class from the card
    card.classList.remove("shoe");

    // Get all child elements of the "board-inner-container"
    const elements = document.getElementById("board-inner-container").children;

    // Calculate the zIndex for the card
    const zIndex = elements.length + 4;

    // Set the zIndex of the card element
    card.style.zIndex = zIndex;
  }
}

/**
 * @class Shoe
 * @description Represents a collection of decks of playing cards, used for dealing in games.
 */
class Shoe {
  /**
   * @constructor
   * @param {number} [decks=8] - The number of decks to include in the shoe.
   */
  constructor(decks = 8, tutorial_deck = undefined) {
    /**
     * @type {Card[]}
     * @description The collection of cards in the shoe.
     */
    this.shoe = [];

    /**
     * @type {Card[]}
     * @description The collection of cards in play.
     */
    this.cardsInPlay = [];

    // Checks if there is a specific deck to be input for the tutorial, and if not,
    // creates a shoe with the number of specified decks.
    if (tutorial_deck === undefined) {
      const suits = ["C", "D", "H", "S"];
      const ranks = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      const values = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
      let deck = [];
      let count = 1;
      for (let i = 0; i < decks; i++) {
        for (let j = 0; j < 4; j++) {
          for (let k = 0; k < 13; k++) {
            deck.push(new Card(suits[j], ranks[k], values[k], count));
            count += 1;
          }
        }
      }

      this.shoe = deck;
    } else {
      this.shoe = tutorial_deck;
    }
  }

  /**
   * @description Shuffles the cards in the shoe randomly.
   * @remarks Implements the Fisher-Yates shuffle algorithm, ensuring an unbiased and efficient randomization of cards.
   */
  shuffle() {
    // For every card in the shoe, it will swap it with a card in a randomly selected place in the shoe,
    // ensuring that the shuffle is fully random as each card has a chance to be in a new place.
    for (let i = this.shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shoe[i], this.shoe[j]] = [this.shoe[j], this.shoe[i]];
    }
  }

  /**
   * @description Displays the current cards in the shoe to the console.
   */
  display() {
    // Declares the deck variable so that the cards can be appended to something in the correct format before being displayed.
    let deck = "";

    // Loops through the shoe 13 cards at a time (one suit) to create a row to be displayed.
    for (let i = 0; i < this.shoe.length / 13; i++) {
      let row = "";

      // Appends each card in the row to the row variable before appending the row to the deck variable.
      for (const card of this.shoe.slice(i * 13, i * 13 + 13)) {
        row += card.name + " ";
      }
      deck += row + "\n";
    }

    // Displays the deck as a formatted string in the console.
    console.log(deck);
  }

  /**
   * @description Deals a single card from the top of the shoe.
   * @returns {Card} The dealt card.
   */
  hit() {
    // Stores the final card in the shoe as a variable so that it can be returned
    const card = this.shoe[this.shoe.length - 1];

    // Removes the card from the shoe.
    this.shoe = this.shoe.slice(0, -1);

    // Returns the final card.
    return card;
  }
}

/**
 * @class Player
 * @description Represents a player in a card game, holding a hand of cards.
 */
class Player {
  /**
   * @constructor
   * @param {string} name - The name of the player.
   * @param {Card[]} [hand=[]] - Optional initial hand of cards.
   */
  constructor(name, wallet = 100) {
    /**
     * @type {string}
     * @description The name of the player.
     */
    this.name = name;

    /**
     * @type {Card[]}
     * @description The cards currently held by the player.
     */
    this.hand = [];

    /**
     * @type {int}
     * @description The bet of the player.
     */
    this.bet = 1;

    /**
     * @type {int}
     * @description The wallet of the player, defaults to 100.
     */
    this.wallet = wallet;
  }

  /**
   * @description Adds a card to the player's hand.
   * @param {Card} card - The card to add.
   * @returns {array} The updated hand of cards.
   */
  receiveCard(card) {
    // Adds the new card to the player's hand.
    this.hand.push(card);

    // Returns the hand with the new card added.
    return this.hand;
  }

  /**
   * @description Calculates the total value of the player's hand, adjusting the values of the Aces if the total exceeds 21.
   * @returns {number} The total value of the hand.
   */
  getHandValue() {
    let total = 0;

    // Find the sum of all the card values
    for (const card of this.hand) {
      total += card.value;
    }

    // Adjust values of Aces if the total is greater than 21
    for (const card of this.hand) {
      if (card.name[1] === "A" && card.value === 11 && total > 21) {
        card.value = 1;
        total -= 10;

        // Stop adjusting Aces once total is 21 or below
        if (total <= 21) {
          break;
        }
      }
    }

    return total;
  }

  /**
   * @description Displays the player's current hand to the console in a legible string format.
   */
  displayHand() {
    // Declares the variable hand to append the cards to.
    let hand = "";

    // Appends each card from the current hand to the hand variable.
    for (const card of this.hand) {
      hand += card.name + " ";
    }

    // Logs all the cards to the console after being formatted in the hand variable.
    console.log(hand);
  }
}

/**
 * @class Dealer
 * @description Represents a dealer in a card game.
 * @extends Player
 */
class Dealer extends Player {
  /**
   * Creates a new Dealer.
   * @param {string} [name="Dealer"] - The dealer's name.
   * @param {Card[]} hand - The dealer's initial hand of cards.
   * @param {Card} hiddenCard - The dealer's hidden card, not initially included in their hand.
   */
  constructor(name = "Dealer", hand, hiddenCard) {
    super(name, hand);
    this.hiddenCard = hiddenCard;
  }

  /**
   * Calculates the total value of the dealer's hand, including the hidden card,
   * and adjusts Ace values strategically to minimize exceeding 21.
   * @returns {number} The total hand value.
   */
  getHandValue() {
    let total = 0;

    // Calculate initial total
    for (const card of this.hand) {
      total += card.value;
    }

    total += this.hiddenCard.value;

    // Adjust Ace values if necessary.
    for (const card of this.hand) {
      if (card.value === 11 && total > 21) {
        card.value = 1; // Change Ace value to 1.
        total -= 10;
        // Continue adjusting Aces until the total is less than or equal to 21.
      } else if (total <= 21) {
        break;
      }
    }

    // If the total is still greater than 21 and the hidden card is an Ace then adjust the total accordingly.
    if (total > 21 && this.hiddenCard.value === 11) {
      total -= 10;
      this.hiddenCard.value = 1;
    }

    return total;
  }
}

/**
 * @class Game
 * @description Manages the overall Blackjack game environment, including players, card distribution, and game logic.
 */
class Game {
  /**
   * @constructor
   * @param {string[]} playerNames - An array of player names.
   * @param {number} decks - The number of decks to use in the game.
   * @param {Card[]} tutorial_deck - An optional deck to be used in the tutorials.
   * @param {boolean} [shuffle=true] - Whether to shuffle the shoe initially.
   */
  constructor(playerNames, decks, tutorial_deck, shuffle = true) {
    let players = [];

    // Ensure there's a minimum of one player and a maximum of 4.
    if (playerNames.length === 0) {
      playerNames.push("Guest");
    } else if (playerNames.length > 4) {
      playerNames = playerNames.slice(0, 4);
    }

    // Create Player instances, handle pre-defined player objects if provided.
    for (const player of playerNames) {
      if (typeof player === "object") {
        const playerInstance = new Player(...player);
        players.push(playerInstance);
      } else {
        const playerInstance = new Player(player);
        players.push(playerInstance);
      }
    }

    // Create a Shoe and shuffle it
    const shoe = new Shoe(decks, tutorial_deck);
    if (shuffle === true) {
      shoe.shuffle();
    }

    // Initialize game properties
    /**
     * @type {Player[]}
     * @description An array containing Player instances.
     */
    this.players = players;

    /**
     * @type {Shoe}
     * @description A Shoe instance for managing cards.
     */
    this.shoe = shoe;

    /**
     * @type {Dealer}
     * @description The Dealer instance for the game.
     */
    this.dealer = new Dealer();
    /**
     * @type {Card[]}
     * @description An array of the cards that have been dealt in the game to aid with
     *              resetting the game at the end of a hand.
     */
    this.dealtCards = [];
    /**
     * @type {int}
     * @description The current player that is to choose an action to play.
     */
    this.currentPlayerIndex = 0;
    /**
     * @type {int}
     * @description Determines the position that the newly dealt card should go to.
     */
    this.positionCount = 0;
    /**
     * @type {int[]}
     * @description A list of the players who have blackjack so their turn may be skipped.
     */
    this.blackjack = [];
    /**
     * @type {int}
     * @description The critical amount of cards remaining in the shoe that will trigger
     *              the shoe to be reset when half the cards have been dealt.
     */
    this.resetShoeAmount = (decks * (this.shoe.shoe.length / decks)) / 2;

    // Ensures that when `this` is used in methods of the `Game` class,
    // that it is referring to the instance of the game object rather than the method itself.
    this.handleStand = this.handleStand.bind(this);
    this.handleHit = this.handleHit.bind(this);
    this.handleDoubleDown = this.handleDoubleDown.bind(this);
    this.dealInitialCards = this.dealInitialCards.bind(this);
    this.resetRound = this.resetRound.bind(this);

    // Allows the deal initial cards method to be added and removed from the deal button.
    this.boundDealClickListener = this.dealInitialCards.bind(
      this,
      this.dealtCards
    );

    // Adds the deal initial cards method to the deal button.
    if (tutorial_type === "") {
      document
        .getElementById("deal")
        .addEventListener("click", this.boundDealClickListener);
    }
  }

  /**
   * @description Creates the shoe and adds the cards to the `dealtCards` attribute of the `Game` class.
   */
  createShoe() {
    let cards = [];

    // Hit cards from the shoe and add them to the cards array.
    for (let i = 0; i < 4; i++) {
      cards.push(this.shoe.hit());
    }

    // Insert created cards visually in the game.
    for (let i = 0; i < 4; i++) {
      cards[i].insertCard(cards[i].createCard());
    }

    // Set zIndex for the first card in the game.
    const firstCard = document.getElementById(
      cards[0].cardNumber
    ).parentElement;
    firstCard.style.zIndex = "14";

    // Adds the dealt cards to `dealtCards` attribute of the game class.
    this.dealtCards = cards;
  }

  /**
   * @description Creates bet & wallet inputs for each player and displays player usernames.
   */
  createBets() {
    /**
     * Validates input value against specified constraints.
     * @param {HTMLInputElement} input - The input element to validate.
     * @param {Object} player - The player object associated with the input.
     */
    function validateInput(input, player) {
      // Ensure the value does not exceed the max attribute.
      if (input.value.length == 0) {
        input.value = input.min;
      } else if (input.value > parseInt(input.max)) {
        input.value = input.max;
      } else if (parseInt(input.value) > parseInt(player.wallet)) {
        input.value = player.wallet;
      } else if (input.value < parseInt(input.min)) {
        input.value = input.min;
      }
    }

    // Define the minimum, maximum values and the step
    // for the bet inputs in accordance with the table stakes.
    const max_values = {
      low: "20",
      medium: "100",
      high: "500",
    };

    const min_values = {
      low: "1",
      medium: "20",
      high: "100",
    };

    const step = {
      low: "1",
      medium: "4",
      high: "20",
    };

    // Create the dealer card outline and add it to the board.
    const dealerCardOutline = document.createElement("div");
    dealerCardOutline.style.width = "102px";
    dealerCardOutline.style.height = "152px";
    dealerCardOutline.style.left = "399px";
    dealerCardOutline.style.top = "49px";
    dealerCardOutline.classList.add("card-outline");

    const board = document.getElementById("board-inner-container");
    board.appendChild(dealerCardOutline);

    // Define the positions for each card outline.
    const cardOutlinePositions = [
      ["99px", "349px"],
      ["299px", "399px"],
      ["499px", "399px"],
      ["699px", "349px"],
    ];

    // Creates a copy of the players array to be used to validate the input.
    const players = this.players;

    // Creates bets, wallets, and usernames on the board for each player.
    for (let i = 0; i < this.players.length; i++) {
      // Create bet label element
      const betLabel = document.createElement("label");
      betLabel.setAttribute("for", `player-${i + 1}-bet`);
      betLabel.setAttribute("id", `player-${i + 1}-bet-label`);
      betLabel.setAttribute("class", "bet-label");
      betLabel.textContent = `Bet:`;

      // Create wallet label element.
      const walletLabel = document.createElement("label");
      walletLabel.setAttribute("for", `player-${i + 1}-wallet`);
      walletLabel.setAttribute("id", `player-${i + 1}-wallet-label`);
      walletLabel.setAttribute("class", "wallet-label");
      walletLabel.textContent = `Wallet:`;

      // Create bet input element.
      const betInput = document.createElement("input");
      betInput.setAttribute("type", "number");
      betInput.setAttribute("name", `player-${i + 1}-bet`);
      // Sets the value of the bet to the minimum value for the table unless it is a tutorial in which it is set to 10.
      betInput.setAttribute(
        "value",
        tutorial_type === "" ? min_values[table_stakes] : 10
      );
      betInput.setAttribute("step", step[table_stakes]);
      betInput.setAttribute("min", min_values[table_stakes]);
      betInput.setAttribute("max", max_values[table_stakes]);
      betInput.setAttribute("id", `player-${i + 1}-bet`);
      betInput.setAttribute("class", "bet");
      // Validates the input every time the input is deselected.
      betInput.addEventListener(
        "blur",
        (function (i) {
          return function () {
            validateInput(this, players[i]);
          };
        })(i)
      );
      betInput.readOnly = tutorial_type !== "";

      // Create wallet input element.
      const walletInput = document.createElement("input");
      walletInput.setAttribute("type", "number");
      walletInput.setAttribute("name", `player-${i + 1}-wallet`);
      walletInput.setAttribute("value", this.players[i].wallet);
      walletInput.setAttribute("id", `player-${i + 1}-wallet`);
      walletInput.setAttribute("class", "wallet");
      walletInput.setAttribute("readonly", "true");

      // Create card outline element.
      const cardOutline = document.createElement("div");
      cardOutline.style.width = "102px";
      cardOutline.style.height = "152px";
      cardOutline.style.left = cardOutlinePositions[i][0];
      cardOutline.style.top = cardOutlinePositions[i][1];
      cardOutline.classList.add("card-outline");

      // Create the username for each player.
      const username = document.createElement("p");
      username.setAttribute("id", `player-${i + 1}-username`);
      username.setAttribute("class", "username");

      // Sets the username to the player if it exists, otherwise sets it to "Guest".
      username.textContent =
        i === 0 && player_username !== "" ? player_username : "Guest";

      // Adds all created elements to the board.
      board.appendChild(betLabel);
      board.appendChild(betInput);
      board.appendChild(walletLabel);
      board.appendChild(walletInput);
      board.appendChild(cardOutline);
      board.appendChild(username);
    }
  }

  /**
   * @description Creates the tutorial card to display the information for each tutorial.
   */
  createTutorial() {
    const board = document.getElementById("board-inner-container");

    // Create the main container.
    const tutorial_card = document.createElement("div");
    tutorial_card.setAttribute("id", "tutorial-card");
    tutorial_card.setAttribute("data-tutorial-card", 0);

    // Create and populate the header section of the card.
    const header = document.createElement("div");
    header.setAttribute("class", "header");

    const title = document.createElement("h3");
    title.textContent = "Objective";
    header.appendChild(title);

    const divider = document.createElement("div");
    divider.setAttribute("class", "divider");
    header.appendChild(divider);

    const tutorial_info = document.createElement("div");
    tutorial_info.setAttribute("id", "tutorial-text");
    header.appendChild(tutorial_info);

    // Create the maths images and adds them to the header.
    const math1 = document.createElement("img");
    math1.setAttribute("id", "math1");
    math1.setAttribute("src", "/static/img/remaining-decks.svg");
    math1.style.display = "none";

    const math2 = document.createElement("img");
    math2.setAttribute("id", "math2");
    math2.setAttribute("src", "/static/img/rounding.svg");
    math2.style.display = "none";

    const math3 = document.createElement("img");
    math3.setAttribute("id", "math3");
    math3.setAttribute("src", "/static/img/true-count.svg");
    math3.style.display = "none";

    header.appendChild(math1);
    header.appendChild(math2);
    header.appendChild(math3);

    // Creates the next button and the next icon within it.
    const next_button = document.createElement("button");
    next_button.setAttribute("id", "next-button");

    const next_icon = document.createElement("img");
    next_icon.setAttribute("src", "/static/img/arrow-forward.svg");
    next_icon.setAttribute("width", "20px");
    next_button.appendChild(next_icon);

    // Adds the elements to the tutorial card and the tutorial card to the board.
    tutorial_card.appendChild(header);
    tutorial_card.appendChild(next_button);

    board.appendChild(tutorial_card);
  }

  /**
   * @description Creates the running count for the card counting tutorial card.
   */
  createCounts() {
    const board = document.getElementById("board-inner-container");

    // Creates the main container.
    const counts = document.createElement("div");
    counts.setAttribute("id", "counts");

    // Creates and populates the row with the running count value and label.
    const row = document.createElement("div");
    row.setAttribute("class", "row");

    const running_count_label = document.createElement("p");
    running_count_label.textContent = "Running count:";

    const running_count = document.createElement("p");
    running_count.setAttribute("id", "running-count");
    running_count.textContent = "-2";

    // Adds the label and value to the row.
    row.appendChild(running_count_label);
    row.appendChild(running_count);

    // Adds the row to the main container, and the main container to the board.
    counts.appendChild(row);
    board.appendChild(counts);
  }

  /**
   * @description Deals initial cards to players and the dealer.
   */
  dealInitialCards() {
    // Remove all the event listeners from the buttons while the cards are being dealt.
    document.getElementById("hit").removeEventListener("click", this.handleHit);
    document
      .getElementById("stand")
      .removeEventListener("click", this.handleStand);
    document
      .getElementById("double-down")
      .removeEventListener("click", this.handleDoubleDown);

    // Selects all the bet elements from the document.
    const bets = document.querySelectorAll(".bet");

    bets.forEach((bet) => {
      // Any bets without an input are set to the minimum bet for the table.
      if (bet.value.length == 0) {
        bet.value = bet.min;
      }

      // Sets the `.bet` attribute of the player to their bet and sets the bet input to readonly.
      const player = bet.name.slice(7, 8) - 1;
      this.players[player].bet = parseInt(bet.value);
      bet.setAttribute("readonly", "true");
    });

    // Displays the correct buttons after the deal cards button is clicked.
    const buttons = document.querySelectorAll("button");
    const playButtons = ["hit", "stand", "double-down"];
    const currentPlayer = document.getElementById("current-player");

    buttons.forEach((button) => {
      if (!button.classList.contains("hidden")) {
        button.classList.add("hidden");
      }

      if (playButtons.includes(button.id)) {
        button.classList.remove("hidden");
      }
    });

    // Defines the positions for the cards to be dealt to.
    const positions = [
      [350, 700],
      [400, 500],
      [400, 300],
      [350, 100],
      [50, 400],
    ];

    // Defines variables to be used in the loop.
    const numPlayers = this.players.length;
    let timer = 300;

    // Loops through the number of cards that need to be dealt: 2 for each player + 2 for the dealer.
    for (let count = 0; count < numPlayers * 2 + 2; count++) {
      sleep(timer).then(() => {
        if (count < numPlayers * 2) {
          // Deal cards to players.
          this.dealtCards[count].dealCard([
            positions[count % numPlayers][0],
            positions[count % numPlayers][1] -
              25 * Math.floor(count / numPlayers),
          ]);
          // Rotate the card.
          this.dealtCards[count].rotateCard();
          // Adds the card to the players hand.
          this.players[count % numPlayers].receiveCard(this.dealtCards[count]);
        } else {
          // Deal cards to the dealer.
          if (count == numPlayers * 2) {
            // Deal the card to the player.
            this.dealtCards[count].dealCard([
              positions[positions.length - 1][0],
              positions[positions.length - 1][1],
            ]);
            // Rotate the card if it is the first card to the dealer.
            this.dealtCards[count].rotateCard();
            // Add the card to the dealers hand.
            this.dealer.receiveCard(this.dealtCards[count]);
          } else {
            // Deal the card to the dealer.
            this.dealtCards[count].dealCard([
              positions[positions.length - 1][0],
              positions[positions.length - 1][1] - 25,
            ]);
            // Set the second card as the dealers hidden card.
            this.dealer.hiddenCard = this.dealtCards[count];
          }
        }
        // Gets a new card from the shoe and adds it to the shoe on the board and the dealt cards array.
        let card = this.shoe.hit();
        card.insertCard(card.createCard());
        this.dealtCards.push(card);
      });

      // Increase the timer so the next card takes 300ms more before it is dealt.
      timer += 300;
    }

    // Waits until all cards have been dealt then adds all players with blackjack to the blackjack array.
    sleep((numPlayers * 2 + 2) * 300).then(() => {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].getHandValue() === 21) {
          this.blackjack.push(i);
        }
      }
    });

    // Skips each players turn if they have blackjack, waiting 800ms between each skip, after all cards have been dealt.
    sleep(timer).then(() => {
      const currentPlayerPositions = [
        ["250px", "735px"],
        ["300px", "535px"],
        ["300px", "335px"],
        ["250px", "135px"],
      ];

      // Show the current player icon.
      currentPlayer.classList.toggle("hidden");
      currentPlayer.style.top = currentPlayerPositions[0][0];
      currentPlayer.style.right = currentPlayerPositions[0][1];

      // Checks if each player has blackjack.
      sleep(800).then(() => {
        // Checks if player 1 has blackjack.
        if (this.blackjack.includes(0)) {
          // If there is only one player go straight to the dealers turn.
          if (this.players.length === 1) {
            sleep(200).then(() => {
              this.dealerTurn();
            });
          } else {
            // If there is more than one player, change the current player icon to player 2.
            currentPlayer.style.top = currentPlayerPositions[1][0];
            currentPlayer.style.right = currentPlayerPositions[1][1];
            this.currentPlayerIndex++;
            sleep(800).then(() => {
              // Checks if player 2 has blackjack.
              if (this.blackjack.includes(1)) {
                // If there are only two players go straight to the dealers turn.
                if (this.players.length === 2) {
                  sleep(200).then(() => {
                    this.dealerTurn();
                  });
                } else {
                  // If there are more than two players, change the current player icon to player 3.
                  currentPlayer.style.top = currentPlayerPositions[2][0];
                  currentPlayer.style.right = currentPlayerPositions[2][1];
                  this.currentPlayerIndex++;
                  sleep(800).then(() => {
                    // Checks if player 3 has blackjack.
                    if (this.blackjack.includes(2)) {
                      // If there are only three players go straight to the dealers turn.
                      if (this.players.length === 3) {
                        sleep(200).then(() => {
                          this.dealerTurn();
                        });
                      } else {
                        // If there are more than two players, change the current player icon to player 3.
                        currentPlayer.style.top = currentPlayerPositions[3][0];
                        currentPlayer.style.right =
                          currentPlayerPositions[3][1];
                        this.currentPlayerIndex++;
                        sleep(800).then(() => {
                          // Checks if player 4 has blackjack.
                          if (this.blackjack.includes(3)) {
                            this.dealerTurn();
                          }
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });

      // Wait for the cards to finish dealing, then add the event listeners to the buttons
      // provided it is not in the tutorial.
      if (!tutorial_type) {
        sleep(800 * this.blackjack.length).then(() => {
          document
            .getElementById("hit")
            .addEventListener("click", this.handleHit);
          document
            .getElementById("stand")
            .addEventListener("click", this.handleStand);
          document
            .getElementById("double-down")
            .addEventListener("click", this.handleDoubleDown);
        });
      }
    });
  }

  /**
   * @description Handles the dealer turn by hitting until the dealer is on 17 or above.
   */
  async dealerTurn() {
    // Removes the event listeners from the user action buttons for the duration of the dealers turn.
    document.getElementById("hit").removeEventListener("click", this.handleHit);
    document
      .getElementById("stand")
      .removeEventListener("click", this.handleStand);
    document
      .getElementById("double-down")
      .removeEventListener("click", this.handleDoubleDown);
    document
      .getElementById("reset")
      .removeEventListener("click", this.resetRound);

    // Defines the positions for the dealers card to be dealt to.
    const positions = [50, 350];

    // Flips the dealers hidden card.
    const hiddenCard = document.getElementById(
      this.dealer.hiddenCard.cardNumber
    );
    hiddenCard.children[0].classList.toggle("flip");
    const currentPlayer = document.getElementById("current-player");

    // Hides the current player icon.
    currentPlayer.classList.toggle("hidden");

    // Starts the loop for the dealer to hit until they reach 17.
    while (this.dealer.getHandValue() < 17) {
      // Adds a delay between dealing each card.
      await sleep(800);

      // Selects the top card from the shoe.
      const count = this.dealtCards.length - 4;
      let card = this.dealtCards[count];

      // Deal a card to the dealer, rotate it, and add it to the dealt cards array.
      card.dealCard([positions[0], positions[1] - 25 * this.positionCount]);
      card.rotateCard();
      let newCard = this.shoe.hit();
      newCard.insertCard(newCard.createCard());
      this.dealer.receiveCard(this.dealtCards[count]);
      this.dealtCards.push(newCard);
      this.positionCount += 1;
    }

    // Hide all buttons.
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      if (!button.classList.contains("hidden")) {
        button.classList.add("hidden");
      }
    });

    // Show the reset button.
    const resetButton = document.getElementById("reset");
    resetButton.classList.remove("hidden");

    // Determines and displays the winner for each player.
    this.determineWinner();

    // Updates all the players wallets.
    const wallets = document.querySelectorAll(".wallet");

    wallets.forEach((wallet) => {
      const player = wallet.id.slice(7, 8) - 1;
      wallet.setAttribute("value", this.players[player].wallet);
    });

    // Delay then add the event listener to the reset button.
    await sleep(1000);
    let page_number = undefined;

    if (tutorial_type !== "") {
      const tutorial_page = document.getElementById("tutorial-card");
      page_number = tutorial_page.getAttribute("data-tutorial-card");
    }

    if (
      (tutorial_type === "") |
      (tutorial_type === "card-counting" && parseInt(page_number) === 30)
    ) {
      document
        .getElementById("reset")
        .addEventListener("click", this.resetRound);
    }
  }

  /**
   * @description Handles the stand input by increasing the current player index.
   */
  handleStand() {
    // Defines the current player icon position for each player.
    const currentPlayerPositions = [
      ["250px", "735px"],
      ["300px", "535px"],
      ["300px", "335px"],
      ["250px", "135px"],
      ["250px", "135px"],
      ["250px", "135px"],
    ];

    // Removes the button event listeners.
    document.getElementById("hit").removeEventListener("click", this.handleHit);
    document
      .getElementById("stand")
      .removeEventListener("click", this.handleStand);
    document
      .getElementById("double-down")
      .removeEventListener("click", this.handleDoubleDown);

    // Moves the current player icon to the next player.
    const currentPlayer = document.getElementById("current-player");
    currentPlayer.style.top =
      currentPlayerPositions[this.currentPlayerIndex + 1][0];
    currentPlayer.style.right =
      currentPlayerPositions[this.currentPlayerIndex + 1][1];

    // Increase the current player index and reset the position count.
    this.currentPlayerIndex++;
    this.positionCount = 0;

    // If the next player has blackjack, skip to the next player.
    if (this.blackjack.includes(this.currentPlayerIndex)) {
      sleep(800).then(() => {
        this.currentPlayerIndex++;
        currentPlayer.style.top =
          currentPlayerPositions[this.currentPlayerIndex + 1][0];
        currentPlayer.style.right =
          currentPlayerPositions[this.currentPlayerIndex + 1][1];
        // If the second 'next' player also has blackjack, skip to the next player.
        if (this.blackjack.includes(this.currentPlayerIndex)) {
          sleep(800).then(() => {
            this.currentPlayerIndex++;
            currentPlayer.style.top =
              currentPlayerPositions[this.currentPlayerIndex + 1][0];
            currentPlayer.style.right =
              currentPlayerPositions[this.currentPlayerIndex + 1][1];

            // If the third 'next' player also has blackjack, skip to the next player.
            if (this.blackjack.includes(this.currentPlayerIndex)) {
              sleep(800).then(() => {
                this.currentPlayerIndex++;

                // This is the last player, so if they have blackjack, call the dealer turn.
                this.dealerTurn();
              });
            }
          });
        }

        // If this is the last player, call the dealer turn, otherwise change it to the next player.
        if (this.currentPlayerIndex >= this.players.length) {
          sleep(200).then(() => {
            this.dealerTurn();
          });
        }
      });
    }

    // If this is the last player, call the dealer turn, otherwise change it to the next player.
    if (this.currentPlayerIndex >= this.players.length) {
      this.dealerTurn();
    } else {
      currentPlayer.style.top =
        currentPlayerPositions[this.currentPlayerIndex][0];

      currentPlayer.style.right =
        currentPlayerPositions[this.currentPlayerIndex][1];

      // Wait 800ms for each player with blackjack, or 800ms if no one has blackjack and then add the button event listeners.
      sleep(
        this.blackjack.length === 0 ? 800 : 800 * this.blackjack.length
      ).then(() => {
        if (!tutorial_type) {
          document
            .getElementById("hit")
            .addEventListener("click", this.handleHit);
          document
            .getElementById("stand")
            .addEventListener("click", this.handleStand);
          document
            .getElementById("double-down")
            .addEventListener("click", this.handleDoubleDown);
        }
      });
    }
  }

  /**
   * @description Handles the hit input by dealing the player a card and handling any other game logic.
   */
  handleHit() {
    // Removes the event listeners from the player input buttons.
    document.getElementById("hit").removeEventListener("click", this.handleHit);
    document
      .getElementById("stand")
      .removeEventListener("click", this.handleStand);
    document
      .getElementById("double-down")
      .removeEventListener("click", this.handleDoubleDown);

    // Defines the positions for each card to be dealt to including the dealer.
    const positions = [
      [350, 700],
      [400, 500],
      [400, 300],
      [350, 100],
      [50, 350],
    ];

    // Sets the count to the number of dealt cards minus the ones in the shoe.
    const count = this.dealtCards.length - 4;

    // Defines the card and position it should be dealt relative to the players card outline.
    let card = this.dealtCards[count];
    let row = Math.floor((this.positionCount + 2) / 4);
    let column = (this.positionCount + 2) % 4;

    // Deal a card to the player, rotate it, and manage game state
    card.dealCard([
      positions[this.currentPlayerIndex][0] + 25 * row,
      positions[this.currentPlayerIndex][1] - 25 * column,
    ]);
    card.rotateCard();
    let newCard = this.shoe.hit();
    newCard.insertCard(newCard.createCard());
    this.players[this.currentPlayerIndex].receiveCard(this.dealtCards[count]);
    this.dealtCards.push(newCard);
    this.positionCount += 1;

    // If the player goes bust or is on 21, end their turn by calling the `handleStand` method.
    if (this.players[this.currentPlayerIndex].getHandValue() >= 21) {
      this.handleStand();
    } else {
      // Wait for the card to be dealt then add the event listeners back to the player input buttons.
      sleep(800).then(() => {
        if (!tutorial_type) {
          document
            .getElementById("hit")
            .addEventListener("click", this.handleHit);
          document
            .getElementById("stand")
            .addEventListener("click", this.handleStand);
          document
            .getElementById("double-down")
            .addEventListener("click", this.handleDoubleDown);
        }
      });
    }
  }

  /**
   * @description Double the players bet, deals them one more card then ends their turn.
   */
  handleDoubleDown() {
    // Gets the current player and doubles their bet.
    const currentPlayer = this.currentPlayerIndex;
    const newBet = this.players[this.currentPlayerIndex].bet * 2;
    const bet = document.getElementById(
      `player-${this.currentPlayerIndex + 1}-bet`
    );
    const wallet = document.getElementById(
      `player-${this.currentPlayerIndex + 1}-wallet`
    ).value;

    // Checks if the player has the funds to double their bet otherwise it will skip.
    if (newBet <= wallet) {
      bet.value = newBet;
      this.players[this.currentPlayerIndex].bet = newBet;

      // Deals the player one more card.
      this.handleHit();

      // If the player doesn't go bust, end their turn and go to the next player.
      if (currentPlayer === this.currentPlayerIndex) {
        this.handleStand();
      }
    }
  }

  /**
   * @description Resets both the visual and logical states of all related objects to the game.
   */
  resetRound() {
    // If it is the basics tutorial, reload the page.
    // If it is on the last page of the card-counting tutorial, reload the page.
    const tutorial_page = document.getElementById("tutorial-card");
    const page_num =
      tutorial_type !== ""
        ? tutorial_page.getAttribute("data-tutorial-card")
        : 0;
    if (
      (tutorial_type === "basics") |
      (tutorial_type === "card-counting" && parseInt(page_num) === 30)
    ) {
      location.reload(true);
    }

    // Remove the event listener from the reset and deal buttons.
    document
      .getElementById("reset")
      .removeEventListener("click", this.resetRound);
    document
      .getElementById("deal")
      .removeEventListener("click", this.boundDealClickListener);

    // Reset the values for dealing cards.
    this.currentPlayerIndex = 0;
    this.positionCount = 0;

    // Reset the position of the current player.
    const currentPlayer = document.getElementById("current-player");
    currentPlayer.style.top = "300px";
    currentPlayer.style.right = "735px";

    // Adds each card from the dealt cards (minus the cards in the shoe) to the played cards array.
    const playedCards = [];
    for (const card of this.dealtCards.slice(0, -4)) {
      playedCards.unshift(document.getElementById(card.cardNumber));
    }

    // Defines a timer for the delay between each removed card.
    let timer = 0;

    // Loops through all the played cards and moves them off the screen and then removes them from the HTML document.
    for (const card of playedCards) {
      sleep(timer).then(() => {
        card.style.top = "-150px";
        card.style.right = "900px";
        sleep(800).then(() => {
          card.remove();
        });
      });
      timer += 200;
    }

    // Removes all the cards from the previous round from the dealt cards array.
    this.dealtCards = this.dealtCards.slice(-4);

    // Resets the UI.
    sleep(playedCards.length * 200 + 800).then(() => {
      const buttons = document.querySelectorAll("button");

      // Displays the deal cards button and hides the rest of the buttons.
      buttons.forEach((button) => {
        if (!button.classList.contains("hidden")) {
          button.classList.add("hidden");
        }

        if (button.id === "deal") {
          if (
            !(tutorial_type === "card-counting" && parseInt(page_num) === 25)
          ) {
            button.classList.remove("hidden");
          }
        } else if (button.id === "reset") {
          if (
            tutorial_type === "card-counting" &&
            parseInt(page_num) === 25
          ) {
            button.classList.remove("hidden");
          }
        }
      });

      const bets = document.querySelectorAll(".bet");
      const wallets = document.querySelectorAll(".wallet");

      // Updates the bets to be no greater than the players wallet or the max bet.
      for (let i = 0; i < bets.length; i++) {
        const bet = bets[i];
        const wallet = wallets[i];

        if (tutorial_type === "") {
          bet.removeAttribute("readonly");
        }

        if (parseInt(bet.value) > parseInt(wallet.value)) {
          bet.value = wallet.value;
        } else if (parseInt(bet.value) > parseInt(bet.max)) {
          bet.value = bet.max;
        }
      }

      const results = document.querySelectorAll(".result");

      // Removes each result from the board.
      results.forEach((result) => {
        result.remove();
      });

      // Resets the players and dealers hands, then calls the `resetShoe` method.
      for (const player of this.players) {
        player.hand = [];
      }

      this.dealer.hand = [];
      this.blackjack = [];
      this.resetShoe();
    });
  }

  /**
   * @description Resets the shoe if the number of remaining cards is less than half the number of the original shoe.
   */
  resetShoe() {
    // Checks if the number of remaining cards in the shoe is less than half the amount of the original shoe.
    if (this.shoe.shoe.length <= this.resetShoeAmount && tutorial_type === "") {
      // Creates the message that a new shoe is being shuffled.
      const reset = document.createElement("div");
      reset.id = "shuffling";
      reset.innerText = "Shuffling new decks";

      // Display the message on the board.
      const board = document.getElementById("board-inner-container");
      board.appendChild(reset);

      // Calculate the number of decks from the reset shoe amount.
      const decks = (this.resetShoeAmount * 2) / 52;

      // Create a new deck and shuffle it before assigning it to the shoe array.
      const newDeck = new Shoe(decks);
      newDeck.shuffle();

      this.shoe = newDeck;

      // Gets all the cards in the shoe from the board.
      const playedCards = Array.from(
        document.getElementById("board-inner-container").children
      ).slice(4, 8);

      let timer = 0;

      // For each of these cards, it moves it off screen then removes it with a small delay between each card.
      for (const card of playedCards) {
        sleep(timer).then(() => {
          card.style.top = "-150px";
          card.style.right = "900px";
          sleep(800).then(() => {
            card.remove();
          });
        });
        timer += 200;
      }

      // Once all the cards have been removed, remove the display message
      // and add the deal cards method back to the deal cards button.
      sleep(200 * playedCards.length + 1000).then(() => {
        this.createShoe();
        document.getElementById("shuffling").remove();
        document
          .getElementById("deal")
          .addEventListener("click", this.boundDealClickListener);
      });
    } else if (tutorial_type === "") {
      // If the conditions to reset the shoe are not met, add the deal
      // cards method back to the deal cards button.
      document
        .getElementById("deal")
        .addEventListener("click", this.boundDealClickListener);
    }
  }

  /**
   * @description Determines the winner of each hand against the dealer, updates UI and sends data to the server.
   */
  determineWinner() {
    // Gets the value of the dealer hand.
    const dealerValue = this.dealer.getHandValue();

    // Defines the positions for the result message for each player.
    const positions = [
      ["100px", "250px"],
      ["300px", "300px"],
      ["500px", "300px"],
      ["700px", "250px"],
    ];

    // Loops through each player to determine winner.
    for (let i = 0; i < this.players.length; i++) {
      // Gets and calculates the values used to determine the winner.
      const playerValue = this.players[i].getHandValue();
      const numPlayerCards = this.players[i].hand.length;
      const numDealerCards = this.dealer.hand.length + 1;
      const playerBet = this.players[i].bet;

      // Creates the result message for the player.
      const result = document.createElement("div");
      result.setAttribute("class", "result");
      result.style.position = "absolute";
      result.style.color = "white";

      // Determines if the player or the dealer have blackjack.
      const playerBlackjack = playerValue === 21 && numPlayerCards === 2;
      const dealerBlackjack = dealerValue === 21 && numDealerCards === 2;

      // Calculates the result for the player and updates the wallet and result message accordingly.
      if (playerBlackjack && !dealerBlackjack) {
        this.players[i].wallet =
          parseInt(this.players[i].wallet) + Math.ceil(1.5 * playerBet);
        result.innerText = "Winner!";
      } else if (dealerBlackjack && !playerBlackjack) {
        this.players[i].wallet = parseInt(this.players[i].wallet) - playerBet;
        result.innerText = "Loser!";
      } else if (playerValue > 21) {
        this.players[i].wallet = parseInt(this.players[i].wallet) - playerBet;
        result.innerText = "Loser!";
      } else if (dealerValue > 21) {
        this.players[i].wallet = parseInt(this.players[i].wallet) + playerBet;
        result.innerText = "Winner!";
      } else if (playerValue > dealerValue) {
        this.players[i].wallet = parseInt(this.players[i].wallet) + playerBet;
        result.innerText = "Winner!";
      } else if (dealerValue > playerValue) {
        this.players[i].wallet = parseInt(this.players[i].wallet) - playerBet;
        result.innerText = "Loser!";
      } else {
        result.innerText = "Push";
      }

      // Gets the username for player 1.
      const username = document.getElementById("player-1-username").textContent;

      // If the loop is on the first player and the players username isn't 'Guest' and it is
      // not in the tutorial then it will send the game stats to the server.
      if (i === 0 && username !== "Guest" && tutorial_type === "") {
        // URL endpoint for the POST request.
        const live_url = `https://blackjack-flask-app.onrender.com/menu/tables/${table_stakes}-stakes-table`;
        const url = `http://127.0.0.1:5000/menu/tables/${table_stakes}-stakes-table`;

        // Create a new FormData object.
        const formData = new FormData();

        // Adds the username and wallet as key value pairs.
        formData.append("username", username);
        formData.append("wallet", this.players[i].wallet);

        // Calculate the players winnings and add it to the form.
        let bet = playerBet;

        if (result.innerText === "Winner!" && playerBlackjack === true) {
          bet = Math.ceil(bet * 1.5);
        } else if (result.innerText === "Loser!") {
          bet *= -1;
        }

        formData.append("profit_loss", bet);

        // Send form data to the server and catch any errors.
        fetch(live_url, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.text())
          .catch((error) => console.error(error));
      }

      // Add the result to the board.
      const board = document.getElementById("board-inner-container");
      board.appendChild(result);
      result.style.left = positions[i][0];
      result.style.top = positions[i][1];
    }
  }
}

/**
 * @description Initialises the game class with all players and a dealer, then adds necessary event listeners.
 */
function main() {
  /**
   * @description Adjusts the width of the left cover based on the board dimensions.
   */
  function adjustLeftCover() {
    const board = document.getElementById("board");
    const leftCover = document.getElementById("left-cover");

    const imageLeftGap = board.getBoundingClientRect().left;
    leftCover.style.width = imageLeftGap + "px";
  }

  // Initialises the game class.
  const game = new Game([
    [player_username === "" ? "Guest" : player_username, player_wallet],
    "Guest",
    "Guest",
    "Guest",
  ]);

  // Add event listeners to adjust left cover on window load and resize.
  window.addEventListener("load", adjustLeftCover);
  window.addEventListener("resize", adjustLeftCover);

  // Initialize game shoe and bets.
  game.createShoe();
  game.createBets();

  // Add event listener to reset button.
  document.getElementById("reset").addEventListener("click", game.resetRound);
}

/**
 * @description Initialises the game class with a scripted deck and a tutorial card in the bottom corner.
 *              Depending on the tutorial type it will display different tutorials and titles in the card.
 *              It will also trigger different events such as dealing the cards depending on the page the
 *              tutorial card is on.
 * @param {string} tutorial_type - The type of tutorial being either 'card-counting' or 'basics'.
 */
function tutorial(tutorial_type) {
  // Stores the tutorial text and titles in a dictionary.
  const tutorials = {
    basics: {
      1: "The objective of blackjack is to obtain a score as close to 21 as possible without going over it.",
      2: "It is each player against the dealer.",
      3: "Each card in blackjack is given a value.",
      4: "Face cards are worth 10, aces can be 1 or 11 to get closer to 21, and all other cards are their numeric value.",
      5: "Your score must be closer to 21 than the dealer and if so, you win the bet that you put down at the start of the hand.",
      6: "The game begins with dealing the initial cards, two to each player and one face up and one face down to the dealer.",
      7: "The player is then given a choice of hit, stand or double down.",
      8: "Hit will deal a card from the shoe to the player.",
      9: "Stand will end the players turn.",
      10: "Double down will deal a card from the shoe, double the players bet and then end the players turn.",
      11: "The players score is then compared to the dealer and will result in a win, loss or a push (draw).",
    },
    "basics-titles": {
      1: "Objective",
      2: "Objective",
      3: "Card Values",
      4: "Card Values",
      5: "Winning",
      6: "Dealing",
      7: "Options",
      8: "Hit",
      9: "Stand",
      10: "Double down",
      11: "Results",
    },
    "card-counting": {
      1: "The objective of card counting is to gain a statistical advantage over the casino.",
      2: "The chance of the player being closer to 21 than the dealer is 50%, but if the player goes bust the dealer will always win.",
      3: "This means the chance of the player winning is less than 50% so in the long run the player will always lose money.",
      4: "Card counting allows the player can gain the advantage by changing the bet in accordance with the advantage.",
      5: "To do this we need to assign a value to each card. We assign +1 to cards 2-6, 0 to cards 7-9 and -1 to cards 10-Ace. ",
      6: "This allows us to keep track of something called the running count.",
      7: "The running count begins at 0 and the value of each dealt card is added to the running count.",
      8: "Following this, we must calculate the true count. The true count is the running count divided by the number of decks left.",
      9: "When the true count is high, the advantage favours the player so they should bet high or decrease them if it is low.",
      10: "This is due to the count being high meaning that there are lots of high cards left in the deck.",
      11: "The number of decks left is often rounded to the nearest half deck for simplicity.",
      12: "We will begin by dealing the cards.",
      13: "The values for the dealt cards from left to right are -1, 0, -1, 0, -1, +1 and 0 for the dealer so the running count is -2.",
      14: "However, since it is the first round we cannot change out bet so we will play this round.",
      15: "The running count is now -5.",
      16: "We will then reset the round.",
      17: "We now need to calculate the true count.",
      18: "To do this we need to divide the running count by the number of remaining decks.",
      19: "8 decks with 14 cards dealt on the last hand means the remaining decks is",
      20: "We will round the number of remaining decks to the nearest half deck.",
      21: "We can now calculate the true count.",
      22: "Since the true count is so low we would bet the table minimum of 1.",
      23: "We will now play another hand.",
      24: "The players will all hit stand or double down.",
      25: "We can now recalculate the running count and true count.",
      26: "The count has now risen so you may think to raise the bet.",
      27: "However, the true count must be 1 for the game to be completely even.",
      28: "From there, for each increase by 1 of the true count, the percent advantage the player has over the dealer increases by 1.",
      29: "So for a true count of 4, the player has a 3% greater chance of winning than the dealer.",
      30: "Using this in combination with perfect basic strategy, the player can gain the edge over the dealer, and win in the long run.",
    },
    "card-counting-titles": {
      1: "Objective",
      2: "Objective",
      3: "Objective",
      4: "Objective",
      5: "Method",
      6: "Method",
      7: "Method",
      8: "Method",
      9: "Method",
      10: "Method",
      11: "Method",
      12: "Dealing",
      13: "Dealing",
      14: "Dealing",
      15: "Dealing",
      16: "Resetting",
      17: "Calculations",
      18: "Calculations",
      19: "Calculations",
      20: "Calculations",
      21: "Calculations",
      22: "Betting",
      23: "Dealing",
      24: "Playing",
      25: "Calculations",
      26: "Statistics",
      27: "Statistics",
      28: "Statistics",
      29: "Statistics",
      30: "Statistics",
    },
  };

  // Creates a deck of cards that is scripted rather than randomised for the tutorials.
  const deck = [];

  const cards = {
    basics: [
      ["C", "8", 8, 1],
      ["S", "A", 11, 2],
      ["S", "J", 10, 3],
      ["H", "K", 10, 4],
      ["S", "4", 4, 5],
      ["D", "5", 5, 6],
      ["S", "4", 4, 7],
      ["D", "10", 10, 8],
      ["H", "10", 10, 9],
      ["S", "5", 5, 10],
      ["D", "7", 7, 11],
      ["S", "7", 7, 12],
      ["D", "10", 10, 13],
      ["H", "10", 10, 14],
      ["H", "J", 10, 15],
    ],

    "card-counting": [
      ["S", "A", 11, 2],
      ["S", "J", 10, 3],
      ["H", "K", 10, 4],
      ["S", "Q", 4, 5],

      // Hand 2
      ["D", "6", 6, 6],
      ["S", "10", 10, 7],
      ["D", "3", 3, 8],
      ["H", "2", 2, 9],
      ["S", "4", 4, 10],
      ["D", "2", 2, 11],
      ["S", "5", 5, 12],
      ["D", "7", 7, 13],
      ["H", "J", 10, 14],
      ["H", "5", 5, 15],
      ["C", "4", 4, 16],
      ["S", "3", 3, 17],
      ["S", "J", 10, 18],
      ["H", "6", 6, 19],
      ["S", "2", 2, 20],

      // Hand 1
      ["D", "J", 10, 21],
      ["S", "10", 10, 22],
      ["D", "10", 10, 23],
      ["H", "9", 9, 24],
      ["S", "5", 5, 25],
      ["D", "7", 7, 26],
      ["S", "7", 7, 27],
      ["D", "10", 10, 28],
      ["H", "10", 10, 29],
      ["H", "J", 10, 30],
    ],
  };

  // Turns the 2d array of cards into `Card` objects and adds them to the deck array.
  for (const card of cards[tutorial_type]) {
    deck.push(new Card(...card));
  }

  // Creates a new game instance with three players, 1 deck, the scripted deck and shuffle set to false.
  const game = new Game(["Guest", "Guest", "Guest"], 1, deck, false);

  // Adjusts the left cover depending on the size of the screen.
  function adjustLeftCover() {
    const board = document.getElementById("board");
    const leftCover = document.getElementById("left-cover");

    const imageLeftGap = board.getBoundingClientRect().left;
    leftCover.style.width = imageLeftGap + "px";
  }

  /**
   * @description Updates the text and title of the tutorial card, also calls any events that need to happen on specific pages.
   */
  function updateTutorialCard() {
    // Gets the page number from the next button.
    const next_button = document.querySelector("#next-button");
    const tutorial_page = document.querySelector("#tutorial-card");
    let page = parseInt(tutorial_page.getAttribute("data-tutorial-card"));
    page += 1;

    // Checks if it is on the last page and removes the next button if so.
    if (page > Object.keys(tutorials[tutorial_type]).length - 1) {
      next_button.remove();
    }
    tutorial_page.setAttribute("data-tutorial-card", page);

    // A script of the events that will occur in the basics or card
    // counting tutorial along with appropriate delays during events.
    if (tutorial_type === "basics") {
      if (page !== 1) {
        // Adds a short delay between going through the tutorial pages.
        next_button.removeEventListener("click", updateTutorialCard);
        sleep(300).then(() => {
          next_button.addEventListener("click", updateTutorialCard);

          if (page === 6) {
            // Deals the cards.
            game.dealInitialCards();

            // Removes the next button functionality then adds it
            // back when the cards have finished dealing.
            next_button.removeEventListener("click", updateTutorialCard);
            sleep(3200).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 8) {
            // Hits on player 1.
            game.handleHit();

            // Removes the next button functionality then adds it
            // back when the card has been dealt to player 1.
            next_button.removeEventListener("click", updateTutorialCard);
            sleep(1000).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 9) {
            // Stands on player 2.
            game.handleStand();

            // Removes the next button functionality then adds it
            // back when the current player icon has switched to the next player.
            next_button.removeEventListener("click", updateTutorialCard);
            sleep(1000).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 10) {
            // Doubles down on player 3.
            game.handleDoubleDown();

            // Removes the next button functionality then adds it
            // back when the card has been dealt to player 3.
            next_button.removeEventListener("click", updateTutorialCard);
            sleep(1000).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          }
        });
      }
    } else if (tutorial_type === "card-counting") {
      // All non-timing related events in the tutorial are handled here,
      // such as creating the counts on the board or displaying the correct images.
      if (page === 13) {
        game.createCounts();
      } else if (page === 19) {
        const math1 = document.getElementById("math1");
        math1.style.display = "block";
      } else if (page === 20) {
        const math2 = document.getElementById("math2");
        math2.style.display = "block";
        const math1 = document.getElementById("math1");
        math1.style.display = "none";
      } else if (page === 21) {
        const math3 = document.getElementById("math3");
        math3.style.display = "block";
        const math2 = document.getElementById("math2");
        math2.style.display = "none";

        const counts = document.getElementById("counts");

        const row = document.createElement("div");
        row.setAttribute("class", "row");
        counts.appendChild(row);

        const true_count_label = document.createElement("p");
        true_count_label.textContent = "True count:";
        row.appendChild(true_count_label);

        const true_count = document.createElement("p");
        true_count.setAttribute("id", "true-count");
        true_count.textContent = "-0.625";
        row.appendChild(true_count);
      } else if (page === 22) {
        const math3 = document.getElementById("math3");
        math3.style.display = "none";

        const bets = document.querySelectorAll(".bet");

        bets.forEach((bet) => {
          bet.value = 1;
        });
      }
      // All timing related events in the tutorial are handled here.
      // such as dealing cards and playing hands.
      if (page !== 1) {
        next_button.removeEventListener("click", updateTutorialCard);
        // Add a small delay between going through the pages.
        sleep(300).then(() => {
          next_button.addEventListener("click", updateTutorialCard);
          if (page === 12) {
            // Deal the initial cards.
            next_button.removeEventListener("click", updateTutorialCard);
            game.dealInitialCards();
            sleep(3200).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 14) {
            // Play a round.
            next_button.removeEventListener("click", updateTutorialCard);
            game.handleHit();
            sleep(800).then(() => {
              game.handleStand();
              sleep(800).then(() => {
                game.handleDoubleDown();
                sleep(1200).then(() => {
                  next_button.addEventListener("click", updateTutorialCard);
                });
              });
            });
          } else if (page === 15) {
            // Update the running count.
            document.querySelector("#counts p:last-child").textContent = "-5";
          } else if (page === 16) {
            // Reset the round.
            next_button.removeEventListener("click", updateTutorialCard);
            game.resetRound();
            sleep(3200).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          }
          if (page === 23) {
            next_button.removeEventListener("click", updateTutorialCard);
            // Deal the initial cards.
            game.dealInitialCards();
            sleep(3200).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 24) {
            next_button.removeEventListener("click", updateTutorialCard);
            // Play a round.
            game.handleHit();
            sleep(800).then(() => {
              game.handleHit();
              sleep(800).then(() => {
                game.handleHit();
                sleep(800).then(() => {
                  game.handleHit();
                  sleep(800).then(() => {
                    game.handleHit();
                    sleep(800).then(() => {
                      game.handleHit();
                      game.handleStand();
                      sleep(800).then(() => {
                        game.handleHit();
                        sleep(1200).then(() => {
                          next_button.addEventListener(
                            "click",
                            updateTutorialCard
                          );
                        });
                      });
                    });
                  });
                });
              });
            });
          } else if (page === 25) {
            // Update the counts.
            document.getElementById("running-count").textContent = "3";
            document.getElementById("true-count").textContent = "0.4";

            // Reset the round.
            next_button.removeEventListener("click", updateTutorialCard);
            game.resetRound();
            sleep(3200).then(() => {
              next_button.addEventListener("click", updateTutorialCard);
            });
          } else if (page === 30) {
            const resetButton = document.getElementById("reset");
            resetButton.addEventListener("click", game.resetRound);
          }
        });
      }
    }

    // Sets the text and title of the tutorial card in accordance with the page number.
    document.getElementById("tutorial-text").textContent =
      tutorials[tutorial_type][page];
    document.querySelector(".header h3").textContent =
      tutorials[`${tutorial_type}-titles`][page];
  }

  // Adjust the left cover whenever the page is loaded or resized.
  window.addEventListener("load", adjustLeftCover);
  window.addEventListener("resize", adjustLeftCover);

  // Create all visual aspects of the tutorial.
  game.createShoe();
  game.createBets();
  game.createTutorial();

  // Updates the tutorial card every time the page is loaded, or the next button is clicked.
  const button = document.querySelector("#next-button");
  button.addEventListener("click", updateTutorialCard);
  window.addEventListener("load", updateTutorialCard);

  // Reloads the page when the reset button is clicked.
  document.getElementById("reset").addEventListener("click", game.resetRound);
}

// Call the main or tutorial function to initialize the game.
if (!tutorial_type) {
  main();
} else {
  tutorial(tutorial_type);
}
