# Новые растровые иллюстрации

Созданы встроенным ImageGen, без CLI/API. Финальные игровые файлы сохранены в `assets/` в формате WebP с сохранением прозрачности. Художественные референсы: ранее утверждённые `heroes.png` и `scenes.png`.

Общий промпт: illustration-story; textured gouache, layered cut-paper fairytale theatre; original friendly characters; consistent faces and costumes; varied warm earthy palette, no purple dominance; isolated sprites on genuinely transparent background; no text. Положения объектов заданы для послойной анимации.

Промпты по атласам:

- `new-heroes.webp`: 3×2 cells. Full-body idle ginger cat, teal/russet dwarf, silver/red knight; pearl/mint ghost, blue/gold wizard, chestnut horse. Empty hands, no actions or props in hero choices.
- `props.webp`: 3×3 cells. Grey mouse, open coin treasure chest, matching lid; blue hat, coral yarn ball, burlap sack; sword and gauntlet, wand and sleeve, walnut wall clock. All props isolated.
- `places.webp`: 2×2 landscapes without characters: amber castle room, green forest clearing, ivory castle courtyard, teal moonlit hall. Clear central stage and lower-third floor.
- `actions.webp`: 3×2 cells. Witch on broom, dwarf carrying sack, knight riding legless horse torso; separate front and rear horse legs; crouching ginger cat and separate paw.
- `extra.webp`: 3×2 cells. Wingless emerald dragon, separate left and right copper/green wings; hollow upright magician's top hat, cat bust with paws, detached dwarf arm.
- `puppets.webp`: 3×2 cells. Knight, wizard and dwarf bodies with one arm absent; corresponding detached full arms holding sword, wand and reaching hand. Final edit: remove all white/checkerboard background and divider lines; preserve objects, positions and colours; output real transparent alpha.

Отдельные части вращаются вокруг плеч, лап и крыльев. Зелье, дым, искры, нитка и маятник дополняют растровые персонажи. Новые иллюстрации не заменяют утверждённые фоны и рамы галереи.

## Исправление восьми анимаций, версия 8

Новые файлы `assets/animation/*.webp` созданы встроенным ImageGen. Растровые фигуры в каждом кадре цельные: старое вращение отдельно вырезанных ног, рук и полос плаща удалено из этих восьми сцен. Тайминги и последовательности находятся в `flipbooks` в `art.js`.

Финальный набор промптов (общие условия: illustration-story, тот же textured gouache layered paper theatre, оригинальные герои как референс, прозрачный фон, одинаковые размеры и положение фигур в равных ячейках, без надписей):

- `horse.webp`: 4×2, eight complete horse-and-rider poses in anatomical gallop sequence; all four legs connected; rider holds reins and follows saddle; consistent torso registration. Final edit removes all white haze and halos, preserves exact poses and positions.
- `walk.webp`: 4×2, eight full dwarf walking poses carrying sack over shoulder; contact/down/passing/up phases; boots support body, knees bend naturally; no separate limbs. Final extraction erases white background to zero alpha without changing poses.
- `flight.webp`: 3×2, six complete witch-and-broom poses; fixed seated body and hands; continuous cape attached at shoulders with free hem waving up/neutral/down; all cape edges intact. Final extraction removes white background preserving positions.
- `sword.webp`: 3×2, six full knight poses progressively raising firmly gripped sword from low diagonal to upright salute; planted feet, coherent connected shoulder/elbow/wrist; no extra arms.
- `chest.webp`: 3×2, six complete dwarf-and-chest compositions; dwarf kneels beside chest, hand tracks lid edge; base and rear hinge fixed; rigid lid opens 0/15/30/50/70/95 degrees revealing coins.
- `hat.webp`: 3×2, cat emerging from inverted pointed witch hat; brim and opening at top, conical crown points down and folds on floor; body occluded by front brim, paws on rim; rising head and blink phases.
- `yarn.webp`: 3×2, complete cat and coral yarn ball in successive contact/push/roll/reach/return poses; paws anatomically attached; ball stays on floor at fixed size with loose yarn.
- `chase.webp`: 3×2, complete cat and mouse poses: crouch, push off, shallow leap, forepaw landing, gather hind paws, crouch; mouse ahead; all animals remain inside frame.

`animation-review.html` показывает живой цикл, замедление, остановку и все позы каждой исправленной сцены. `tests/animation.cjs` проверяет индексы кадров, границы исходных изображений и повторение циклов. Проверка логики игры: `tests/game.cjs`.
