import requests
import time

api_url = "https://lm7dl01i3e.execute-api.us-east-1.amazonaws.com/prod"

#Helpers
def print_board(board):

    print("\n\t|", end="")

    for x in range(0, 3):
        print(board[x] + "|", end="")

    print("\n\t|", end="")

    for x in range(3, 6):
        print(board[x] + "|", end="")

    print("\n\t|", end="")

    for x in range(6, 9):
        print(board[x] + "|", end="")

    print()

def DB2board(board):
    gameBoard = []

    for entry in board :
        if entry == 1:
            gameBoard.append('X')
        elif entry == 0:
            gameBoard.append('O')
        else:
            gameBoard.append('-')

    return gameBoard

def board2DB(index, userSymbol, board):
    newBoard = []

    for entry in board :
        if entry == 'X':
            newBoard.append(1)
        elif entry == 'O':
            newBoard.append(0)
        else:
            newBoard.append(-1)

    newBoard[index] = userSymbol

    return newBoard

def cli_start():

    cont = 0

    while cont == 0:
    
        option = input("\nLogin or Register?\n-> ")

        if option.lower() == "login":
            return 0
        elif option.lower() == "register":
            return 1
        else:
            print("")

def cli_gameOptions():

    cont = 0

    while cont == 0:
    
        option = input("\nJoin or Create?\n-> ")

        if option.lower() == "join":
            return 0
        elif option.lower() == "create":
            return 1
        else:
            print("")

def cli_login():
    userName = input("\nEnter Username: ")
    passWord = input("Enter Password: ")

    headers = {
        'Content-Type': 'application/json',
    }

    json_data = {
        'username': userName,
        'password': passWord,
    }

    response = requests.post(f"{api_url}/login", headers=headers,json=json_data)

    if response.status_code >= 400:
        loggedIn = False
        token = ""
        print("\nERR: " + response.json()['message'] + "\n")
    else:
        loggedIn = True
        token = response.json()['idToken']

    return [loggedIn, token, userName]

def cli_register():
    userName = input("\nEnter Username: ")
    passWord = input("Enter Password: ")
    eMail = input("Enter Email: ")

    headers = {
        'Content-Type': 'application/json',
    }

    json_data = {
        'username': userName,
        'password': passWord,
        'email': eMail,
    }

    response = requests.post(f"{api_url}/users", headers=headers,json=json_data)
    if response.status_code >= 400:
        registered = False
        print("\nERR: " + response.json()['message'] + "\n")
    else:
        registered = True

    return registered

def join_game(token):
    gameId = input("\nEnter game ID: ")

    joined = False

    if validate_game(gameId) == True:

        headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
        }

        response = requests.post(f"{api_url}/games/{gameId}/join", headers=headers)
        if response.status_code >= 400:
            print("\nERR: " + response.json()['message'] + "\n")
        else:
            joined = True

        return [joined, gameId]
    else:
        return [joined, gameId]
    
def create_game(token):
    eMail = input("\nEnter opponents email: ")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
    }

    json_data = {
        'opponentEmail': eMail,
    }

    response = requests.post(f"{api_url}/games", headers=headers,json=json_data)

    if response.status_code >= 400:
        gameCreated = False
        gameId = -1
        print("\nERR: " + response.json()['message'] + "\n")
    else:
        gameCreated = True
        gameId = response.json()['gameId']

    return [gameCreated, gameId]

def fetch_game(gameId):

    response = requests.get(f"{api_url}/games/{gameId}")

    if response.status_code >= 400:
        board = -1
        print("\nERR: " + response.json()['message'] + "\n")
    else:
        board = response.json()['gameBoard']
    return board

def validate_game(gameId):
    response = requests.get(f"{api_url}/games/{gameId}")

    if response.status_code >= 400:
        print("\nERR: " + response.json()['message'] + "\n")
        return False
    else:
        try:
            response.json()
        except:
            print("Invalid gameId")
            return False
        else:
            return True

def player_turn(board):
    loop = True

    while loop:
        index = input("\nSelect a board position to fill [1:9]\n(left -> right : top -> bottom)\n-> ")
        if index.isdigit():
            index = int(index)

            if (0 < index < 10):
                if (board[index - 1] != '-'):
                    print("\nERR: Position already filled")
                else:
                    loop = False
            else:
                print("\nERR: Invalid position")
        else:
            print("\nERR: Enter an integer")

    return (index - 1)

def submit_turn(token, newGameBoard, gameId):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
    }

    json_data = {
        'newGameBoard': newGameBoard,
    }

    response = requests.post(f"{api_url}/games/{gameId}", headers=headers,json=json_data)

    if response.status_code >= 400:
        submitted = False
        print("\nERR: " + response.json()['message'] + "\n")
    else:
        submitted = True
    
    return submitted

def poll_for_turn(gameId, userName):
    response = requests.get(f"{api_url}/games/{gameId}")

    if response.status_code >= 400: # error fetching
        print("\nERR: " + response.json()['message'] + "\n")
        yourTurn = False
    else:
        if response.json()['lastMoveBy'] == userName:
            yourTurn = False
        else:
            yourTurn = True

    return yourTurn

def check4win(gameBoard):
    
    if (gameBoard[0] == gameBoard[1]) and (gameBoard[1] == gameBoard[2]) and gameBoard[0] != '-':   # Rows
        win = True
    
    elif (gameBoard[3] == gameBoard[4]) and (gameBoard[4] == gameBoard[5]) and gameBoard[3] != '-':
        win = True

    elif (gameBoard[6] == gameBoard[7]) and (gameBoard[7] == gameBoard[8]) and gameBoard[6] != '-':
        win = True

    elif (gameBoard[0] == gameBoard[3]) and (gameBoard[3] == gameBoard[6]) and gameBoard[0] != '-': # Columns
        win = True

    elif (gameBoard[1] == gameBoard[4]) and (gameBoard[4] == gameBoard[7]) and gameBoard[1] != '-':
        win = True

    elif (gameBoard[2] == gameBoard[5]) and (gameBoard[5] == gameBoard[8]) and gameBoard[2] != '-':
        win = True

    elif (gameBoard[0] == gameBoard[4]) and (gameBoard[4] == gameBoard[8]) and gameBoard[0] != '-': # Diagonals
        win = True

    elif (gameBoard[2] == gameBoard[4]) and (gameBoard[4] == gameBoard[6]) and gameBoard[2] != '-':
        win = True

    else:
        win = False
    
    return win

def check4tie(gameBoard):
    tie = True
    i = 0
    while tie and i < 9:
        if gameBoard[i] == '-':
            tie = False
        i+=1

    return tie

def game_end(message):
    print("\n\tGAME OVER!\n\t" + message)

#MAIN
def main():
    print("\tTIC-TAC-TOE")
    loggedIn = False
    
    while not loggedIn:
        startRes = cli_start() # start

        if startRes == 0: # user chose to login
            loginList = cli_login()

            if loginList[0] == True:
                loggedIn = True
                token = loginList[1]
                userName = loginList[2]

        elif startRes == 1: # user chose to register
            if cli_register() :
                loginList = cli_login() # redirect to login

                if loginList[0] == True:
                    loggedIn = True
                    token = loginList[1]
                    userName = loginList[2]

    gameStarted = False

    while not gameStarted:
        option = cli_gameOptions() # join or create game

        if option == 0: # join game
            gameList = join_game(token)
            gameStarted = gameList[0]
            userSymbol = 0 # user is O's

        elif option == 1: # create game
            gameList = create_game(token)
            gameStarted = gameList[0]
            userSymbol = 1 # user is X's

    gameId = gameList[1]

    gameContinue = True

    print("\tSTARTING GAME:\n")
    
    while gameContinue: # game loop
        
        while not poll_for_turn(gameId, userName):
                time.sleep(2) # keep polling every 2 seconds
        
        gameBoard = DB2board(fetch_game(gameId)) # get the board

        print_board(gameBoard) # print it

        if check4win(gameBoard): # check for win (loss)
            gameContinue = False    
            game_end("You Lost...")

        elif check4tie(gameBoard): # check for tie
            gameContinue = False    
            game_end("You Tied.")

        else:
            index = player_turn(gameBoard) # get user input
            newDBBoard = board2DB(index, userSymbol, gameBoard) # update board in DB format
            newGameBoard = DB2board(newDBBoard) # update board with input
            print_board(newGameBoard) # new board being printed
            print("\n -------New-Turn-------")
            submit_turn(token, newDBBoard, gameId) # submit input with updated board

            if check4win(newGameBoard): # check for win (win)
                gameContinue = False    
                game_end("You Win!")

            elif check4tie(newGameBoard): # check for tie
                gameContinue = False    
                game_end("You Tied.")

if __name__ == "__main__":
    main()
