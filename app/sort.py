def merge(leftArray: list, rightArray: list) -> list:
    """
    Merge two sorted arrays into a single sorted array.

    Args:
        leftArray (list): The left sorted array.
        rightArray (list): The right sorted array.

    Returns:
        list: The merged array.

    Example:
        >>> merge([0, 4, 6, 7], [1, 2, 3, 4])
        [0, 1, 2, 3, 4, 4, 6, 7]
    """
    # Initialise the array to be returned and counter variables.
    array = []
    i = j = 0

    # Merge the two arrays while maintaining the sorted order
    while i < len(leftArray) and j < len(rightArray):
        if leftArray[i] < rightArray[j]:
            array.append(leftArray[i])
            i += 1
        else:
            array.append(rightArray[j])
            j += 1

    # Extend the array with the remaining elements from leftArray and rightArray
    array.extend(leftArray[i:])
    array.extend(rightArray[j:])

    # Return the array with items merged in order.
    return array


def merge_sort(array: list) -> list:
    """
    Sorts an array using the merge sort algorithm.

    Args:
        array (list): The array to be sorted.

    Returns:
        list: The sorted array.

    Example:
        >>> merge_sort([10, 7, 6, 7], [2, 2, 3, 0])
        [0, 2, 2, 3, 6, 7, 7, 10]
    """
    # Base case: If the length of the array is 0 or 1, it is already sorted.
    if len(array) <= 1:
        return array

    # Find the middle index of the array.
    middle = len(array) // 2

    # Recursively sort the left and right halves of the array.
    leftArray = merge_sort(array[:middle])
    rightArray = merge_sort(array[middle:])

    # Merge the sorted left and right halves.
    return merge(leftArray, rightArray)


def sort_rows(rows: list[list], column: int, reverse: bool = False):
    """
    Sorts a list of rows based on a specific column in ascending or descending order.

    Args:
        rows (list): List of rows, where each row is a list.
        column (int): The index of the column to sort by.
        reverse (bool, optional): If True, sort in descending order. Defaults to False.

    Returns:
        list: The sorted list of rows.

    Example:
        >>> data = [[17-03-2024, 20:08, 3, 400, 133, Medium],
                    [15-03-2024, 17:18, 6, 300, 50, Medium]]
        >>> sort_rows(data, 2, True)
        [[15-03-2024, 17:18, 6, 300, 50, Medium],
         [17-03-2024, 20:08, 3, 400, 133, Medium]]
    """

    # Extract the data from the specified column
    data = [row[column] for row in rows]

    # Sort the table stakes column separately to the other columns since it is text.
    if column == 5:
        # Define your custom list with the desired order.
        sort_order = ['Low', 'Medium', 'High']

        # Initialize an empty list to store the sorted elements.
        sorted_data = []

        # Iterate through the sort_order and append elements from the original list
        # in the order defined by the custom list.
        for item in sort_order:
            for element in data:
                if element == item:
                    sorted_data.append(element)
    # Sort the rest of the columns using the `merge_sort` function.
    else:
        # Sort the data using merge sort.
        sorted_data = merge_sort(data)

    # Reverse the sorted data if reverse is True.
    if reverse:
        sorted_data.reverse()

    # Initialises a variable to append the sorted rows to.
    sorted_rows = []

    # Create a copy of the rows using list comprehension to avoid mutation.
    rows_copy = [row[:] for row in rows]

    # Sort the rows based on the sorted data.
    for value in sorted_data:
        for row in rows_copy:
            if row[column] == value:
                sorted_rows.append(row)
                # Remove the row from the copy to avoid duplicates.
                rows_copy.remove(row)

    # Return the sorted rows
    return sorted_rows
