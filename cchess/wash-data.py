#! /usr/bin/python

# The map list for id of chessman
chessmanID_a = [
    0x0a, 0x08, 0x06, 0x04, 0x02, 0x05, 0x07, 0x09, 0x0b, 0x0c, 0x0d, 0x10,
    0x11, 0x12, 0x13, 0x14
]

chessmanId = chessmanID_a

# Translate coordinate from int(XY) to int(pos) form.
# In which, XY is an integer with two digits; X and Y are began from 0 to 8 and 9.
# While pos is began from 11 to 109.
translateXY2Pos = lambda p: 0 if p == 99 else (p // 10) + 11 + (p % 10) * 10
translateXYString2Poses = lambda a: [translateXY2Pos(int(a[i:i + 2])) for i in range(0, len(a), 2)]

flipX = lambda e: e + 10 - 2 * (e % 10)


def arrangementGen(a):
    res = []
    for i, v in enumerate(translateXYString2Poses(a)):
        if v == 0: continue
        res.append(chessmanId[i % 16] + int(i < 16) * 0x20)
        res.append(v)
    return res


def stepInstructionGen(a):
    b = translateXYString2Poses(a)
    return [b[i:i + 2] for i in range(0, len(b), 2)]


def canju():
    result = []
    with open("qipu.txt") as f:
        for l in f.readlines():
            arr = list(l.strip().split())
            arr[1] = arrangementGen(arr[1])
            arr[2] = stepInstructionGen(arr[2])
            result.append(arr)
    result.sort(key=lambda x: len(x[2]))

    with open("qipu.js", "w") as f:
        f.write(str(result))


def opening():
    res = set()
    with open("opening.txt") as f:
        for l in f.readlines():
            arr = translateXYString2Poses(l.strip())
            if arr[0] % 10 > 5: arr = map(flipX, arr)

            txt = ''.join(map(chr, arr))
            res.add(txt)

    res = sorted(list(res))
    with open("opening.js", "w") as f:
        f.write("var openningData = ")
        f.write(str(res))
        f.write(";")
    return res


if __name__ == '__main__':
    pass
    opening()
