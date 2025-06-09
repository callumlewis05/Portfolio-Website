def right_rotate(value: int, shift: int) -> int:
    """
    Perform a right rotation (a right shift where the bits that would usually 
    be cut off are added to the other end) and turns the `value` into a 32 bit integer.

    Args:
        value (int): The value to rotate.
        shift (int): The number of bits to shift.

    Returns:
        int: The result of the right rotation.

    Example:
        >>> right_rotate(0b0001, 1)
        2147483648  # 0b10000000000000000000000000000000
    """

    return (value >> shift) | (value << (32 - shift)) & 0xFFFFFFFF


def hash(password: str, salt: str) -> str:
    """
    Compute the SHA-256 hash of the input password.

    Args:
        password (str): The input password to hash.
        salt (str): The salt to be added to the password to ensure the same password does not return the same hash.

    Returns:
        str: The SHA-256 hash value as a hexadecimal string.

    Example:
        >>> hash("Hello world!", 88a176efbb5d47e09b120da915709666)
        'dfc46e6e4973713658acdee143eb2c9a84d401080944e5c7f3aef0463fa398cc'
    """

    # Hash values:
    # The first 32 bits (stored in Hexadecimal) of the fractional parts of the square roots of the first 8 primes.
    h0 = 0x6a09e667
    h1 = 0xbb67ae85
    h2 = 0x3c6ef372
    h3 = 0xa54ff53a
    h4 = 0x510e527f
    h5 = 0x9b05688c
    h6 = 0x1f83d9ab
    h7 = 0x5be0cd19

    # Round constants:
    # The first 32 bits (stored in Hexadecimal) of the fractional parts of the cube roots of the first 64 primes.
    k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]

    # Pre-processing (Padding):
    original_password = (password + salt).encode('utf-8')
    password_length = len(original_password) * 8

    # Append the bit '1' to the password.
    original_password += b'\x80'

    # Add 0 bits until the password is a multiple of 512.
    original_password += b'\x00' * ((56 - len(original_password) % 64) % 64)

    # Append length of password (before pre-processing) as 64-bit big-endian integer.
    original_password += password_length.to_bytes(8, 'big')

    # Process the password in successive 512-bit chunks.
    for chunk_start in range(0, len(original_password), 64):
        chunk = original_password[chunk_start:chunk_start + 64]

        # Initialize the password schedule array of 32-bit words (currently blank).
        # Labelled as 'w' for conciseness.
        w = [0] * 64

        # Initialize hash value for this chunk.
        a = h0
        b = h1
        c = h2
        d = h3
        e = h4
        f = h5
        g = h6
        h = h7

        # Extend the first 16 words into the remaining 48 words of the password schedule array.
        for i in range(16):
            w[i] = int.from_bytes(chunk[i * 4:i * 4 + 4], 'big')

            for i in range(16, 64):
                s0 = right_rotate(
                    w[i - 15], 7) ^ right_rotate(w[i - 15], 18) ^ (w[i - 15] >> 3)
                s1 = right_rotate(
                    w[i - 2], 17) ^ right_rotate(w[i - 2], 19) ^ (w[i - 2] >> 10)
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xFFFFFFFF

        # Compression function main loop.
        for i in range(64):
            S1 = right_rotate(e, 6) ^ right_rotate(e, 11) ^ right_rotate(e, 25)
            ch = (e & f) ^ ((~e) & g)
            temp1 = (h + S1 + ch + k[i] + w[i]) & 0xFFFFFFFF
            S0 = right_rotate(a, 2) ^ right_rotate(a, 13) ^ right_rotate(a, 22)
            maj = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (S0 + maj) & 0xFFFFFFFF

            # & gates truncate the results to 32 bits.
            h = g
            g = f
            f = e
            e = (d + temp1) & 0xFFFFFFFF
            d = c
            c = b
            b = a
            a = (temp1 + temp2) & 0xFFFFFFFF

        # Add the compressed chunk to the current hash value.
        h0 = (h0 + a) & 0xFFFFFFFF
        h1 = (h1 + b) & 0xFFFFFFFF
        h2 = (h2 + c) & 0xFFFFFFFF
        h3 = (h3 + d) & 0xFFFFFFFF
        h4 = (h4 + e) & 0xFFFFFFFF
        h5 = (h5 + f) & 0xFFFFFFFF
        h6 = (h6 + g) & 0xFFFFFFFF
        h7 = (h7 + h) & 0xFFFFFFFF

    # Produce the final hash value (big-endian).
    digest = (h0 << 224) | (h1 << 192) | (h2 << 160) | (
        h3 << 128) | (h4 << 96) | (h5 << 64) | (h6 << 32) | h7

    # Return the hash as a hexadecimal string.
    return hex(digest)[2:]
