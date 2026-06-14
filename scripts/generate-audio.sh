#!/bin/bash
# Generates pre-built audio clips for all letter/number phrases using macOS Samantha voice.
# Output: public/audio/*.mp3
# Run once from project root: bash scripts/generate-audio.sh
#
# Flags:
#   --force   Overwrite existing files (use after changing phoneme text)

set -e

VOICE="Samantha"
RATE=148   # ~25% slower than default — comfortable for ages 2-6
OUTPUT_DIR="./public/audio"
FORCE=0

for arg in "$@"; do
  [ "$arg" = "--force" ] && FORCE=1
done

mkdir -p "$OUTPUT_DIR"

generate() {
  local filename="$1"
  local text="$2"
  local tmp="/tmp/${filename%.mp3}.aiff"
  local out="$OUTPUT_DIR/$filename"

  if [ -f "$out" ] && [ "$FORCE" -eq 0 ]; then
    echo "  skip  $filename (already exists — use --force to regenerate)"
    return
  fi

  echo "  gen   $filename"
  say -v "$VOICE" -r "$RATE" "$text" -o "$tmp"
  ffmpeg -loglevel error -i "$tmp" -codec:a libmp3lame -q:a 4 "$out"
  rm "$tmp"
}

echo "==> Generating letter audio (A-Z)..."
generate "letter-a.mp3" "A... ahh sound... A is for Apple!"
generate "letter-b.mp3" "B... buh sound... B is for Balloon!"
generate "letter-c.mp3" "C... kuh sound... C is for Cat!"
generate "letter-d.mp3" "D... duh sound... D is for Dog!"
generate "letter-e.mp3" "E... ehh sound... E is for Elephant!"
generate "letter-f.mp3" "F... fuh sound... F is for Fish!"
generate "letter-g.mp3" "G... guh sound... G is for Grapes!"
generate "letter-h.mp3" "H... huh sound... H is for Hat!"
generate "letter-i.mp3" "I... eye sound... I is for Ice cream!"
generate "letter-j.mp3" "J... juh sound... J is for Jellyfish!"
generate "letter-k.mp3" "K... kuh sound... K is for Kite!"
generate "letter-l.mp3" "L... luh sound... L is for Lion!"
generate "letter-m.mp3" "M... mmm sound... M is for Moon!"
generate "letter-n.mp3" "N... nuh sound... N is for Nose!"
generate "letter-o.mp3" "O... ohh sound... O is for Orange!"
generate "letter-p.mp3" "P... puh sound... P is for Penguin!"
generate "letter-q.mp3" "Q... kwuh sound... Q is for Queen!"
generate "letter-r.mp3" "R... ruh sound... R is for Rainbow!"
generate "letter-s.mp3" "S... suh sound... S is for Star!"
generate "letter-t.mp3" "T... tuh sound... T is for Train!"
generate "letter-u.mp3" "U... uhh sound... U is for Umbrella!"
generate "letter-v.mp3" "V... vuh sound... V is for Volcano!"
generate "letter-w.mp3" "W... wuh sound... W is for Watermelon!"
generate "letter-x.mp3" "X... ks sound... X is for Xylophone!"
generate "letter-y.mp3" "Y... yuh sound... Y is for Yarn!"
generate "letter-z.mp3" "Z... zuh sound... Z is for Zebra!"

echo ""
echo "==> Generating number audio (0-9)..."
generate "number-0.mp3" "Zero! Zero means nothing is here... but that is pretty special!"
generate "number-1.mp3" "One! 1... One! Let's count! 1!"
generate "number-2.mp3" "Two! 2... Two! Let's count! 1, 2!"
generate "number-3.mp3" "Three! 3... Three! Let's count! 1, 2, 3!"
generate "number-4.mp3" "Four! 4... Four! Let's count! 1, 2, 3, 4!"
generate "number-5.mp3" "Five! 5... Five! Let's count! 1, 2, 3, 4, 5!"
generate "number-6.mp3" "Six! 6... Six! Let's count! 1, 2, 3, 4, 5, 6!"
generate "number-7.mp3" "Seven! 7... Seven! Let's count! 1, 2, 3, 4, 5, 6, 7!"
generate "number-8.mp3" "Eight! 8... Eight! Let's count! 1, 2, 3, 4, 5, 6, 7, 8!"
generate "number-9.mp3" "Nine! 9... Nine! Let's count! 1, 2, 3, 4, 5, 6, 7, 8, 9!"

echo ""
echo "==> Generating miscellaneous audio..."
generate "welcome.mp3" "Welcome to KeyJr! Press any key to start exploring!"

echo ""
echo "Done! $(ls "$OUTPUT_DIR"/*.mp3 | wc -l | tr -d ' ') audio files in $OUTPUT_DIR"
