set -B                  # enable brace expansion
PLAYERS="Aleks David Ettore Gui Joe Sam"
for player in $PLAYERS; do
  curl -X POST http://localhost:5000/players/$player
done
