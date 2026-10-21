export type LearningLevel = "Beginner" | "Intermediate" | "Advanced";

export interface LessonModule {
  id: string;
  number: number;
  level: LearningLevel;
  title: string;
  shortTitle: string;
  duration: string;
  summary: string;
  objectives: string[];
  explanation: string[];
  exampleCode: string;
  exampleOutput: string;
  exerciseTitle: string;
  exercisePrompt: string;
  starterCode: string;
  solutionCode: string;
  expectedOutputContains: string[];
  requiredConstructs?: string[];
  hints: string[];
  nextStepHint: string;
}

export interface QuizQuestion {
  id: string;
  level: LearningLevel;
  module: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  explanation: string;
}

export const CURRICULUM_LESSONS: LessonModule[] = [
  // ==================== BEGINNER (1–8) ====================
  {
    id: "beg-1-setup-first-program",
    number: 1,
    level: "Beginner",
    title: "Python Setup & Your First Program",
    shortTitle: "Setup & First Program",
    duration: "15 min",
    summary:
      "Understand how Python executes code line by line, write comments, and display text using print().",
    objectives: [
      "Understand how the Python interpreter reads and executes scripts top to bottom",
      "Use print() to display messages and numerical expressions",
      "Document code intent clearly with # single-line comments",
    ],
    explanation: [
      "Python is an interpreted, high-level language celebrated for readable syntax that closely mirrors plain English. Rather than requiring manual memory management or verbose boilerplate, Python runs instructions sequentially from top to bottom.",
      "The built-in print() function sends text or values to standard output. Text inside quotes is called a string literal, while numbers can be printed or calculated directly inside print().",
      "Lines beginning with # are comments. Python ignores them during execution, making them ideal for explaining why your code makes a specific decision.",
    ],
    exampleCode: `# Welcome to NaomiLearn Python Academy
print("Hello, NaomiLearn!")
print("2 + 3 equals:", 2 + 3)`,
    exampleOutput: `Hello, NaomiLearn!\n2 + 3 equals: 5`,
    exerciseTitle: "Print Your Academy Greeting",
    exercisePrompt:
      "Write a Python program that prints 'Welcome to NaomiLearn' on the first line and the result of 7 * 6 on the second line.",
    starterCode: `# 1. Print "Welcome to NaomiLearn"
print("Welcome to NaomiLearn")

# 2. Print the result of 7 * 6
print(7 * 6)
`,
    solutionCode: `print("Welcome to NaomiLearn")
print(7 * 6)`,
    expectedOutputContains: ["Welcome to NaomiLearn", "42"],
    requiredConstructs: ["print"],
    hints: [
      'Use print("Welcome to NaomiLearn") with exact capitalization.',
      "On the next line, call print(7 * 6) without quotes around the math expression.",
    ],
    nextStepHint: "Next, store values in named variables so your programs can remember data.",
  },
  {
    id: "beg-2-variables-data-types",
    number: 2,
    level: "Beginner",
    title: "Variables & Core Data Types",
    shortTitle: "Variables & Data Types",
    duration: "20 min",
    summary:
      "Store strings, integers, floats, and booleans in variables and combine them with f-strings.",
    objectives: [
      "Assign values to descriptive snake_case variable names",
      "Distinguish between str, int, float, and bool types using type()",
      "Format readable output cleanly using f-strings",
    ],
    explanation: [
      "A variable is a named label attached to a value in memory. In Python, you create a variable using the assignment operator (=), such as student_name = 'Naomi'.",
      "Python automatically tracks the data type of each value: whole numbers are integers (int), decimal numbers are floating-point (float), text is a string (str), and truth values are booleans (True or False).",
      "Formatted string literals (f-strings) let you embed variables or expressions directly inside curly braces {} by prefixing the string with f.",
    ],
    exampleCode: `learner = "Naomi"
lessons_completed = 4
accuracy = 96.5
is_active = True

print(f"{learner} completed {lessons_completed} lessons with {accuracy}% accuracy.")
print("Type of accuracy:", type(accuracy).__name__)`,
    exampleOutput: `Naomi completed 4 lessons with 96.5% accuracy.\nType of accuracy: float`,
    exerciseTitle: "Format a Student Profile Summary",
    exercisePrompt:
      "Create a variable course = 'Python' and level = 1. Use an f-string to print exactly: Learning Python - Level 1",
    starterCode: `course = "Python"
level = 1

# Print "Learning Python - Level 1" using an f-string
`,
    solutionCode: `course = "Python"
level = 1
print(f"Learning {course} - Level {level}")`,
    expectedOutputContains: ["Learning Python - Level 1"],
    requiredConstructs: ["course", "level", "print"],
    hints: [
      'Start your print string with f"..." so Python evaluates curly braces.',
      'Write print(f"Learning {course} - Level {level}").',
    ],
    nextStepHint: "Now learn how to perform calculations and compare values with operators.",
  },
  {
    id: "beg-3-io-operators",
    number: 3,
    level: "Beginner",
    title: "Input, Output & Operators",
    shortTitle: "Input/Output & Operators",
    duration: "20 min",
    summary: "Convert data types, compute arithmetic expressions, and combine logical comparisons.",
    objectives: [
      "Use arithmetic operators (+, -, *, /, //, %, **) accurately",
      "Convert numeric strings to integers or floats with int() and float()",
      "Combine comparisons using and, or, and not",
    ],
    explanation: [
      "Python supports standard arithmetic plus floor division (//) which drops the remainder, modulo (%) which returns the remainder, and exponentiation (**).",
      "When reading text input or parsing strings like '42', you must convert them with int('42') or float('3.14') before performing math.",
      "Comparison operators (==, !=, <, >, <=, >=) evaluate to True or False and can be chained with logical operators (and, or, not).",
    ],
    exampleCode: `total_minutes = 135
hours = total_minutes // 60
remaining_minutes = total_minutes % 60

print(f"{total_minutes}m = {hours}h {remaining_minutes}m")
print("Over 2 hours?", hours >= 2 and remaining_minutes > 0)`,
    exampleOutput: `135m = 2h 15m\nOver 2 hours? True`,
    exerciseTitle: "Compute Quotient & Remainder",
    exercisePrompt:
      "Given coins = 29 and bag_capacity = 6, calculate full_bags using // and leftover using %. Print both values on one line separated by a space.",
    starterCode: `coins = 29
bag_capacity = 6

# Calculate full_bags and leftover, then print them
`,
    solutionCode: `coins = 29
bag_capacity = 6
full_bags = coins // bag_capacity
leftover = coins % bag_capacity
print(full_bags, leftover)`,
    expectedOutputContains: ["4 5"],
    requiredConstructs: ["//", "%"],
    hints: [
      "Use coins // bag_capacity to get the whole number of full bags (4).",
      "Use coins % bag_capacity to get the remainder (5), then call print(full_bags, leftover).",
    ],
    nextStepHint: "Use boolean comparisons to make decisions with if, elif, and else.",
  },
  {
    id: "beg-4-conditions",
    number: 4,
    level: "Beginner",
    title: "Conditionals (if, elif, else)",
    shortTitle: "Conditionals (if/else)",
    duration: "25 min",
    summary: "Branch program execution based on dynamic conditions and indentation blocks.",
    objectives: [
      "Write clean if, elif, and else decision trees",
      "Use 4-space indentation to define code blocks",
      "Handle edge cases with nested or compound boolean conditions",
    ],
    explanation: [
      "Conditional statements allow your program to react differently depending on the data it holds. Python tests the if condition first; if True, its indented block runs.",
      "You can chain additional checks using elif (else if), and provide a fallback else block that runs only when every preceding condition was False.",
      "In Python, indentation is not cosmetic—it defines which statements belong inside a branch.",
    ],
    exampleCode: `score = 88

if score >= 90:
    badge = "Gold"
elif score >= 75:
    badge = "Silver"
else:
    badge = "Bronze"

print(f"Score {score} earns the {badge} badge.")`,
    exampleOutput: `Score 88 earns the Silver badge.`,
    exerciseTitle: "Classify Temperature Status",
    exercisePrompt:
      "Given temp = 24, write an if/elif/else statement that prints 'Hot' if temp >= 30, 'Warm' if temp >= 20, and 'Cool' otherwise.",
    starterCode: `temp = 24

# Write your if/elif/else decision block below
`,
    solutionCode: `temp = 24
if temp >= 30:
    print("Hot")
elif temp >= 20:
    print("Warm")
else:
    print("Cool")`,
    expectedOutputContains: ["Warm"],
    requiredConstructs: ["if", "else"],
    hints: [
      "Check temp >= 30 first, then elif temp >= 20:",
      "Remember the colon : at the end of each if, elif, and else line.",
    ],
    nextStepHint: "Next, repeat actions automatically without duplicating code using loops.",
  },
  {
    id: "beg-5-loops",
    number: 5,
    level: "Beginner",
    title: "Loops (for & while)",
    shortTitle: "Loops",
    duration: "25 min",
    summary:
      "Iterate over sequences and number ranges with for loops, while loops, break, and continue.",
    objectives: [
      "Generate numeric sequences with range(start, stop, step)",
      "Accumulate totals and filter items inside a for loop",
      "Control loop execution safely with while, break, and continue",
    ],
    explanation: [
      "A for loop visits each item in a sequence—such as a list of words or numbers generated by range()—and runs its indented body once per item.",
      "Note that range(1, 6) starts at 1 and stops just before 6, yielding 1, 2, 3, 4, 5.",
      "A while loop repeats as long as its condition remains True. Use break to exit a loop early or continue to skip to the next iteration.",
    ],
    exampleCode: `total = 0
for num in range(1, 6):
    total += num
    print(f"Added {num} -> running total: {total}")`,
    exampleOutput: `Added 1 -> running total: 1\nAdded 2 -> running total: 3\nAdded 3 -> running total: 6\nAdded 4 -> running total: 10\nAdded 5 -> running total: 15`,
    exerciseTitle: "Sum Even Numbers in a Range",
    exercisePrompt:
      "Use a for loop to calculate the sum of all even numbers from 2 to 10 (inclusive) and print the final sum.",
    starterCode: `even_sum = 0

# Loop through even numbers from 2 to 10 and add to even_sum
`,
    solutionCode: `even_sum = 0
for n in range(2, 11, 2):
    even_sum += n
print(even_sum)`,
    expectedOutputContains: ["30"],
    requiredConstructs: ["for", "range"],
    hints: [
      "range(2, 11, 2) produces 2, 4, 6, 8, 10.",
      "Inside the loop, add each number to even_sum, then print(even_sum) outside the loop.",
    ],
    nextStepHint:
      "Organize multiple values together using Python lists, tuples, sets, and dictionaries.",
  },
  {
    id: "beg-6-collections",
    number: 6,
    level: "Beginner",
    title: "Lists, Tuples, Sets & Dictionaries",
    shortTitle: "Collections & Dictionaries",
    duration: "30 min",
    summary: "Store ordered sequences, immutable records, unique elements, and key-value mappings.",
    objectives: [
      "Index, slice, and mutate lists with append(), pop(), and sort()",
      "Choose tuples for fixed records and sets for deduplication",
      "Lookup and update structured records using dictionary keys",
    ],
    explanation: [
      "Lists ([]) hold ordered, mutable sequences where items are accessed by 0-based index. Tuples (()) are ordered but immutable, protecting fixed coordinates or configurations from accidental changes.",
      "Sets ({}) store unique, unordered items and automatically remove duplicates.",
      "Dictionaries ({key: value}) map unique keys to values for instant O(1) lookups.",
    ],
    exampleCode: `scores = [85, 92, 78, 92]
unique_scores = sorted(set(scores))
student = {"name": "Naomi", "track": "AI Academy", "best": max(unique_scores)}

print("Unique sorted:", unique_scores)
print(f"{student['name']} ({student['track']}) top score: {student['best']}")`,
    exampleOutput: `Unique sorted: [78, 85, 92]\nNaomi (AI Academy) top score: 92`,
    exerciseTitle: "Build & Query a Dictionary",
    exercisePrompt:
      "Given inventory = {'apples': 5, 'bananas': 8}, add 4 more to 'apples', add a new key 'oranges' with value 10, and print the total sum of all values.",
    starterCode: `inventory = {"apples": 5, "bananas": 8}

# Update apples, add oranges, and print sum(inventory.values())
`,
    solutionCode: `inventory = {"apples": 5, "bananas": 8}
inventory["apples"] += 4
inventory["oranges"] = 10
print(sum(inventory.values()))`,
    expectedOutputContains: ["27"],
    requiredConstructs: ["inventory", "print"],
    hints: [
      "Use inventory['apples'] += 4 and inventory['oranges'] = 10.",
      "Call print(sum(inventory.values())) to output 27.",
    ],
    nextStepHint: "Package reusable logic into clean, parameterized functions.",
  },
  {
    id: "beg-7-functions",
    number: 7,
    level: "Beginner",
    title: "Functions, Parameters & Return Values",
    shortTitle: "Functions",
    duration: "25 min",
    summary: "Define reusable functions with def, default arguments, and explicit return values.",
    objectives: [
      "Define functions with def and pass positional and keyword arguments",
      "Understand the difference between returning a value and printing it",
      "Use default parameter values and docstrings",
    ],
    explanation: [
      "Functions let you write logic once and call it anywhere. You define a function using def function_name(parameters): followed by an indented body.",
      "The return statement sends a computed result back to the caller and exits the function immediately. Without return, a function returns None.",
      "Default parameters (like bonus=0) make arguments optional when calling the function.",
    ],
    exampleCode: `def calculate_xp(lessons: int, bonus: int = 50) -> int:
    """Return total XP earned from lessons plus bonus."""
    return lessons * 100 + bonus

print("Standard XP:", calculate_xp(3))
print("Boosted XP:", calculate_xp(3, bonus=120))`,
    exampleOutput: `Standard XP: 350\nBoosted XP: 420`,
    exerciseTitle: "Write a Rectangle Area Function",
    exercisePrompt:
      "Define a function area(width, height=10) that returns width * height. Print the result of calling area(5) and area(5, 4) on separate lines.",
    starterCode: `# Define def area(width, height=10):
`,
    solutionCode: `def area(width, height=10):
    return width * height

print(area(5))
print(area(5, 4))`,
    expectedOutputContains: ["50", "20"],
    requiredConstructs: ["def area", "return"],
    hints: [
      "Write def area(width, height=10): and return width * height inside.",
      "Then call print(area(5)) and print(area(5, 4)).",
    ],
    nextStepHint: "Learn how to diagnose bugs and build a complete mini-project.",
  },
  {
    id: "beg-8-debugging-mini-project",
    number: 8,
    level: "Beginner",
    title: "Debugging & Beginner Capstone Project",
    shortTitle: "Debugging & Mini Project",
    duration: "30 min",
    summary:
      "Read Python tracebacks, fix SyntaxError/TypeError/IndexError bugs, and build a Gradebook Analyzer.",
    objectives: [
      "Read traceback line numbers and exception types to pinpoint bugs",
      "Fix off-by-one loop errors and mismatched data types",
      "Combine lists, dictionaries, loops, and functions into a working analyzer",
    ],
    explanation: [
      "When Python encounters an error, it prints a traceback showing the exact line and error type: SyntaxError (invalid grammar), NameError (undefined variable), TypeError (incompatible types), or IndexError (out-of-range index).",
      "In this Beginner Capstone, you will combine functions, loops, and conditionals to compute a student's average score and status.",
    ],
    exampleCode: `def summarize_grades(grades):
    if not grades:
        return "No grades recorded"
    avg = sum(grades) / len(grades)
    status = "Pass" if avg >= 70 else "Review"
    return f"Average: {avg:.1f} ({status})"

print(summarize_grades([80, 90, 85]))`,
    exampleOutput: `Average: 85.0 (Pass)`,
    exerciseTitle: "Fix & Run the Score Analyzer",
    exercisePrompt:
      "Write a function pass_count(scores) that returns how many scores in the list are >= 75. Call print(pass_count([60, 75, 88, 92, 70])).",
    starterCode: `def pass_count(scores):
    count = 0
    # Count how many scores are >= 75 and return count

print(pass_count([60, 75, 88, 92, 70]))`,
    solutionCode: `def pass_count(scores):
    count = 0
    for s in scores:
        if s >= 75:
            count += 1
    return count

print(pass_count([60, 75, 88, 92, 70]))`,
    expectedOutputContains: ["3"],
    requiredConstructs: ["def pass_count", "return"],
    hints: [
      "Loop through each score in scores and check if s >= 75:",
      "Increment count += 1 and return count at the end of the function.",
    ],
    nextStepHint:
      "Congratulations on finishing Beginner! Move to Intermediate to master deeper Python tools.",
  },

  // ==================== INTERMEDIATE (9–16) ====================
  {
    id: "int-1-strings-collections-depth",
    number: 9,
    level: "Intermediate",
    title: "Strings & Collections in Depth",
    shortTitle: "Strings & Collections",
    duration: "30 min",
    summary: "Master slicing, string methods, unpacking, and collections.Counter / defaultdict.",
    objectives: [
      "Use sequence slicing [start:stop:step] and negative indices",
      "Clean and transform text with split(), join(), strip(), and replace()",
      "Count and group items effortlessly with collections.Counter",
    ],
    explanation: [
      "Python strings are immutable sequences supporting rich transformation methods: .strip() removes whitespace, .split() breaks text into a list of tokens, and ' '.join() stitches tokens back together.",
      "Slicing syntax seq[start:stop:step] works across strings, lists, and tuples—for example, text[::-1] reverses a sequence in one expression.",
      "The standard library collections module provides Counter and defaultdict to eliminate boilerplate counting loops.",
    ],
    exampleCode: `from collections import Counter

sentence = "python ai python code ai python"
word_counts = Counter(sentence.split())
print("Top word:", word_counts.most_common(1)[0])`,
    exampleOutput: `Top word: ('python', 3)`,
    exerciseTitle: "Clean & Normalize Tags",
    exercisePrompt:
      "Given raw = '  Python, AI , Data, python  ', split by comma, strip whitespace, convert each tag to lowercase, and print the sorted list of unique tags.",
    starterCode: `raw = "  Python, AI , Data, python  "

# Clean, lowercase, deduplicate, and print the sorted list
`,
    solutionCode: `raw = "  Python, AI , Data, python  "
tags = sorted({part.strip().lower() for part in raw.split(",")})
print(tags)`,
    expectedOutputContains: ["['ai', 'data', 'python']"],
    requiredConstructs: ["split", "strip", "lower"],
    hints: [
      "Split raw by ',' with raw.split(','), then call .strip().lower() on each item.",
      "Wrap in set() to remove duplicates and sorted() to order alphabetically.",
    ],
    nextStepHint: "Explore advanced function signatures, *args, **kwargs, and module organization.",
  },
  {
    id: "int-2-functions-modules-packages",
    number: 10,
    level: "Intermediate",
    title: "Advanced Functions, Modules & Packages",
    shortTitle: "Modules & *args/**kwargs",
    duration: "30 min",
    summary: "Use *args, **kwargs, lambda expressions, closures, and standard module imports.",
    objectives: [
      "Accept variable positional (*args) and keyword (**kwargs) arguments",
      "Pass functions as first-class arguments to sorted(), map(), and filter()",
      "Import specific symbols cleanly from Python packages",
    ],
    explanation: [
      "In Python, functions are first-class objects. You can pass them as arguments (such as key functions in sorted()) or return them from outer functions.",
      "*args packs extra positional arguments into a tuple, while **kwargs packs extra keyword arguments into a dictionary.",
    ],
    exampleCode: `def build_query(table: str, *fields: str, **filters) -> str:
    cols = ", ".join(fields) if fields else "*"
    where = " AND ".join(f"{k}={v!r}" for k, v in filters.items())
    return f"SELECT {cols} FROM {table} WHERE {where}"

print(build_query("students", "name", "xp", level="Intermediate", active=True))`,
    exampleOutput: `SELECT name, xp FROM students WHERE level='Intermediate' AND active=True`,
    exerciseTitle: "Flexible Multiplier with *args",
    exercisePrompt:
      "Write a function multiply_all(*numbers) that returns the product of all passed numbers (starting from 1). Print multiply_all(2, 3, 4).",
    starterCode: `def multiply_all(*numbers):
    # Multiply all values in numbers and return the product
    pass

print(multiply_all(2, 3, 4))`,
    solutionCode: `def multiply_all(*numbers):
    product = 1
    for n in numbers:
        product *= n
    return product

print(multiply_all(2, 3, 4))`,
    expectedOutputContains: ["24"],
    requiredConstructs: ["*numbers", "return"],
    hints: [
      "Initialize product = 1, then loop for n in numbers: product *= n.",
      "Return product and print multiply_all(2, 3, 4).",
    ],
    nextStepHint:
      "Learn how to read and write structured data files safely using context managers.",
  },
  {
    id: "int-3-file-handling",
    number: 11,
    level: "Intermediate",
    title: "File Handling, Context Managers & JSON",
    shortTitle: "File Handling & JSON",
    duration: "25 min",
    summary: "Use with context managers, in-memory streams, CSV/JSON serialization, and pathlib.",
    objectives: [
      "Manage file and buffer lifecycles safely with the with statement",
      "Serialize and parse structured data using the json module",
      "Process tabular text lines cleanly",
    ],
    explanation: [
      "The with statement (context manager) guarantees that files or resources are properly closed even if an exception occurs inside the block.",
      "Python's built-in json module converts dictionaries and lists to JSON strings via json.dumps() and parses them back via json.loads().",
    ],
    exampleCode: `import json

payload = '{"academy": "NaomiLearn", "modules": 24, "certified": true}'
data = json.loads(payload)
data["completed"] = 11
print(json.dumps(data, sort_keys=True))`,
    exampleOutput: `{"academy": "NaomiLearn", "certified": true, "completed": 11, "modules": 24}`,
    exerciseTitle: "Parse & Update JSON Config",
    exercisePrompt:
      'Use the json module to parse raw_json = \'{"user": "Ada", "points": 150}\', add 50 to \'points\', and print the updated points value.',
    starterCode: `import json

raw_json = '{"user": "Ada", "points": 150}'
# Parse raw_json, add 50 to points, and print the new points value
`,
    solutionCode: `import json

raw_json = '{"user": "Ada", "points": 150}'
obj = json.loads(raw_json)
obj["points"] += 50
print(obj["points"])`,
    expectedOutputContains: ["200"],
    requiredConstructs: ["json.loads", "print"],
    hints: [
      "Call obj = json.loads(raw_json) to get a Python dictionary.",
      "Add 50 to obj['points'] and print(obj['points']).",
    ],
    nextStepHint: "Next, make your programs resilient to runtime failures with exception handling.",
  },
  {
    id: "int-4-exceptions",
    number: 12,
    level: "Intermediate",
    title: "Exceptions & Defensive Programming",
    shortTitle: "Exceptions (try/except)",
    duration: "25 min",
    summary:
      "Catch specific exceptions with try/except/else/finally and raise custom validation errors.",
    objectives: [
      "Catch targeted exceptions like ValueError, KeyError, and ZeroDivisionError",
      "Use else and finally blocks appropriately",
      "Validate inputs and raise informative ValueError messages",
    ],
    explanation: [
      "Instead of letting invalid user input crash a program, wrap risky operations in a try block and handle specific errors in except clauses.",
      "Always catch specific exception classes (like ValueError or ZeroDivisionError) rather than a bare except:, so unexpected bugs aren't silently hidden.",
    ],
    exampleCode: `def safe_divide(a: float, b: float) -> str:
    try:
        result = a / b
    except ZeroDivisionError:
        return "Error: Cannot divide by zero"
    else:
        return f"Result: {result:.2f}"

print(safe_divide(15, 3))
print(safe_divide(10, 0))`,
    exampleOutput: `Result: 5.00\nError: Cannot divide by zero`,
    exerciseTitle: "Safe Integer Parser",
    exercisePrompt:
      "Write a function parse_int(val) that tries to return int(val), and returns -1 if a ValueError occurs. Print parse_int('42') and parse_int('abc').",
    starterCode: `def parse_int(val):
    # Use try / except ValueError
    pass

print(parse_int("42"))
print(parse_int("abc"))`,
    solutionCode: `def parse_int(val):
    try:
        return int(val)
    except ValueError:
        return -1

print(parse_int("42"))
print(parse_int("abc"))`,
    expectedOutputContains: ["42", "-1"],
    requiredConstructs: ["try", "except", "ValueError"],
    hints: [
      "Put return int(val) inside the try: block.",
      "Put return -1 inside the except ValueError: block.",
    ],
    nextStepHint: "Model real-world entities with classes and Object-Oriented Programming.",
  },
  {
    id: "int-5-oop",
    number: 13,
    level: "Intermediate",
    title: "Object-Oriented Programming (Classes & Objects)",
    shortTitle: "Object-Oriented Programming",
    duration: "35 min",
    summary: "Design classes with __init__, instance methods, properties, and __repr__.",
    objectives: [
      "Define classes and initialize attributes inside __init__(self, ...)",
      "Encapsulate behavior in instance methods that mutate or query state",
      "Implement readable object representations with __str__ or __repr__",
    ],
    explanation: [
      "Object-Oriented Programming (OOP) bundles data (attributes) and behavior (methods) into reusable blueprints called classes.",
      "When you instantiate a class, Python calls __init__(self, ...) to bind initial state to the new instance referenced by self.",
    ],
    exampleCode: `class StudentAccount:
    def __init__(self, name: str, xp: int = 0):
        self.name = name
        self.xp = xp

    def complete_lesson(self, points: int = 100) -> None:
        self.xp += points

    def __str__(self) -> str:
        return f"StudentAccount({self.name}, xp={self.xp})"

acct = StudentAccount("Naomi", 200)
acct.complete_lesson(150)
print(acct)`,
    exampleOutput: `StudentAccount(Naomi, xp=350)`,
    exerciseTitle: "Create a Counter Class",
    exercisePrompt:
      "Create a class StepCounter with __init__(self, steps=0), a method walk(self, amount) that adds amount to self.steps, and print the steps after walking 1200.",
    starterCode: `class StepCounter:
    # Implement __init__ and walk
    pass

c = StepCounter()
c.walk(1200)
print(c.steps)`,
    solutionCode: `class StepCounter:
    def __init__(self, steps=0):
        self.steps = steps

    def walk(self, amount):
        self.steps += amount

c = StepCounter()
c.walk(1200)
print(c.steps)`,
    expectedOutputContains: ["1200"],
    requiredConstructs: ["class StepCounter", "def __init__", "def walk"],
    hints: [
      "In __init__(self, steps=0): set self.steps = steps.",
      "In walk(self, amount): add amount to self.steps.",
    ],
    nextStepHint: "Write expressive, Pythonic transformations using comprehensions and iterators.",
  },
  {
    id: "int-6-iterators-comprehensions",
    number: 14,
    level: "Intermediate",
    title: "Iterators & List/Dict/Set Comprehensions",
    shortTitle: "Iterators & Comprehensions",
    duration: "30 min",
    summary:
      "Transform and filter data concisely with list, dictionary, and set comprehensions plus enumerate and zip.",
    objectives: [
      "Write readable list, set, and dictionary comprehensions",
      "Pair sequences cleanly with zip() and track indices with enumerate()",
      "Understand the iterator protocol (iter() and next())",
    ],
    explanation: [
      "Comprehensions provide a concise, declarative syntax for building new collections from existing iterables: [expr for item in iterable if condition].",
      "Built-in helpers like enumerate(items, start=1) and zip(names, scores) eliminate manual index counters.",
    ],
    exampleCode: `names = ["Ada", "Grace", "Alan"]
scores = [95, 98, 91]

leaderboard = {name: score for name, score in zip(names, scores) if score >= 92}
print(leaderboard)`,
    exampleOutput: `{'Ada': 95, 'Grace': 98}`,
    exerciseTitle: "Squares of Odd Numbers Comprehension",
    exercisePrompt:
      "Use a list comprehension to build a list of squares (n ** 2) for all odd numbers from 1 to 9 inclusive, and print the list.",
    starterCode: `# Build odd_squares using a list comprehension and print it
`,
    solutionCode: `odd_squares = [n ** 2 for n in range(1, 10) if n % 2 == 1]
print(odd_squares)`,
    expectedOutputContains: ["[1, 9, 25, 49, 81]"],
    requiredConstructs: ["for", "in", "["],
    hints: [
      "Use [n ** 2 for n in range(1, 10) if n % 2 != 0].",
      "Print the resulting list to output [1, 9, 25, 49, 81].",
    ],
    nextStepHint: "Discover Python's batteries-included standard library modules.",
  },
  {
    id: "int-7-standard-library",
    number: 15,
    level: "Intermediate",
    title: "Standard Library Power Tools",
    shortTitle: "Standard Library",
    duration: "25 min",
    summary:
      "Leverage math, statistics, itertools, datetime, and re for everyday engineering tasks.",
    objectives: [
      "Compute descriptive metrics with math and statistics",
      "Combine and chain iterables with itertools",
      "Match patterns in text using regular expressions (re)",
    ],
    explanation: [
      "Python's standard library includes battle-tested modules for statistics, combinatorics (itertools), dates (datetime), and regular expressions (re).",
      "Before reaching for external dependencies, check if a standard library module solves the problem in two lines.",
    ],
    exampleCode: `import statistics
import re

latencies = [12, 18, 15, 22, 14, 15]
log = "User #402 completed lesson #15 in 18ms"

print("Mean latency:", statistics.mean(latencies))
print("Numbers in log:", re.findall(r"\\d+", log))`,
    exampleOutput: `Mean latency: 16\nNumbers in log: ['402', '15', '18']`,
    exerciseTitle: "Compute Median with statistics",
    exercisePrompt: "Import the statistics module and print the median of [14, 8, 22, 19, 11].",
    starterCode: `import statistics

values = [14, 8, 22, 19, 11]
# Print the median of values
`,
    solutionCode: `import statistics

values = [14, 8, 22, 19, 11]
print(statistics.median(values))`,
    expectedOutputContains: ["14"],
    requiredConstructs: ["statistics.median"],
    hints: ["Call statistics.median(values) inside print()."],
    nextStepHint: "Synthesize your Intermediate skills in a practical data-processing project.",
  },
  {
    id: "int-8-practical-project",
    number: 16,
    level: "Intermediate",
    title: "Intermediate Capstone: Log & Study Tracker",
    shortTitle: "Practical Project",
    duration: "35 min",
    summary:
      "Combine classes, comprehensions, and aggregation to build a structured study analytics engine.",
    objectives: [
      "Aggregate multi-record datasets by category",
      "Filter and rank summaries cleanly",
      "Format structured report outputs",
    ],
    explanation: [
      "Real-world Python applications ingest raw records, validate fields, aggregate totals per group, and produce human-readable summaries.",
      "In this capstone, you will aggregate study session minutes by topic and report the highest-focus subject.",
    ],
    exampleCode: `sessions = [
    {"topic": "Loops", "minutes": 25},
    {"topic": "OOP", "minutes": 40},
    {"topic": "Loops", "minutes": 20},
]

totals = {}
for s in sessions:
    totals[s["topic"]] = totals.get(s["topic"], 0) + s["minutes"]

top_topic = max(totals, key=totals.get)
print(f"Top topic: {top_topic} ({totals[top_topic]} mins)")`,
    exampleOutput: `Top topic: Loops (45 mins)`,
    exerciseTitle: "Aggregate Module Scores",
    exercisePrompt:
      "Given records = [('Python', 10), ('AI', 15), ('Python', 20)], aggregate the total points per subject into a dictionary and print the total for 'Python'.",
    starterCode: `records = [("Python", 10), ("AI", 15), ("Python", 20)]
totals = {}

# Sum points per subject and print totals["Python"]
`,
    solutionCode: `records = [("Python", 10), ("AI", 15), ("Python", 20)]
totals = {}
for subject, pts in records:
    totals[subject] = totals.get(subject, 0) + pts
print(totals["Python"])`,
    expectedOutputContains: ["30"],
    requiredConstructs: ["for", "totals"],
    hints: [
      "Unpack each tuple with for subject, pts in records:",
      "Use totals[subject] = totals.get(subject, 0) + pts, then print(totals['Python']).",
    ],
    nextStepHint:
      "Ready for Advanced Python! Dive into decorators, generators, type systems, and async architecture.",
  },

  // ==================== ADVANCED (17–24) ====================
  {
    id: "adv-1-decorators-generators",
    number: 17,
    level: "Advanced",
    title: "Decorators & Lazy Generators",
    shortTitle: "Decorators & Generators",
    duration: "35 min",
    summary:
      "Write higher-order function wrappers with @functools.wraps and memory-efficient streams with yield.",
    objectives: [
      "Build function decorators that log, time, or validate calls",
      "Preserve function metadata using functools.wraps",
      "Stream large or infinite sequences lazily using yield and generator expressions",
    ],
    explanation: [
      "A decorator is a callable that takes a function and returns an enhanced wrapper function without modifying the original function's source code.",
      "Generators use the yield keyword to produce values one at a time on demand, keeping memory usage constant even over millions of records.",
    ],
    exampleCode: `from functools import wraps

def trace(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        result = fn(*args, **kwargs)
        print(f"[TRACE] {fn.__name__}{args} -> {result}")
        return result
    return wrapper

@trace
def fibonacci_sum(n: int) -> int:
    def gen(limit):
        a, b = 0, 1
        for _ in range(limit):
            yield a
            a, b = b, a + b
    return sum(gen(n))

fibonacci_sum(6)`,
    exampleOutput: `[TRACE] fibonacci_sum(6,) -> 12`,
    exerciseTitle: "Create a Countdown Generator",
    exercisePrompt:
      "Write a generator function countdown(n) using yield that yields numbers from n down to 1. Print list(countdown(4)).",
    starterCode: `def countdown(n):
    # Yield numbers from n down to 1
    pass

print(list(countdown(4)))`,
    solutionCode: `def countdown(n):
    while n >= 1:
        yield n
        n -= 1

print(list(countdown(4)))`,
    expectedOutputContains: ["[4, 3, 2, 1]"],
    requiredConstructs: ["yield", "def countdown"],
    hints: [
      "Use a while n >= 1: loop (or range(n, 0, -1)) and yield each value.",
      "Call print(list(countdown(4))) to output [4, 3, 2, 1].",
    ],
    nextStepHint:
      "Next, explore dataclasses, inheritance, protocols, and dunder methods in Advanced OOP.",
  },
  {
    id: "adv-2-advanced-oop",
    number: 18,
    level: "Advanced",
    title: "Advanced Object-Oriented Design & Dataclasses",
    shortTitle: "Advanced OOP Design",
    duration: "35 min",
    summary: "Use @dataclass, inheritance, composition, @property, and operator overloading.",
    objectives: [
      "Eliminate boilerplate with @dataclass(frozen=True) and computed fields",
      "Favor composition and clean interfaces over brittle deep inheritance",
      "Implement custom dunder methods (__eq__, __lt__, __len__, __call__)",
    ],
    explanation: [
      "Python's dataclasses module automatically generates __init__, __repr__, and __eq__ from type-annotated class fields.",
      "By implementing special dunder (double underscore) methods like __add__ or __lt__, your custom objects integrate seamlessly with Python's built-in operators and sorting functions.",
    ],
    exampleCode: `from dataclasses import dataclass

@dataclass(order=True, frozen=True)
class ModelCheckpoint:
    accuracy: float
    epoch: int
    name: str

runs = [
    ModelCheckpoint(0.91, 5, "baseline"),
    ModelCheckpoint(0.96, 8, "transformer-v2"),
]
print("Best checkpoint:", max(runs))`,
    exampleOutput: `Best checkpoint: ModelCheckpoint(accuracy=0.96, epoch=8, name='transformer-v2')`,
    exerciseTitle: "Build a 2D Vector Dataclass",
    exercisePrompt:
      "Use @dataclass to define Vector(x: int, y: int) with a method magnitude_sq(self) returning x**2 + y**2. Print Vector(3, 4).magnitude_sq().",
    starterCode: `from dataclasses import dataclass

# Define @dataclass class Vector with x: int, y: int and magnitude_sq(self)
`,
    solutionCode: `from dataclasses import dataclass

@dataclass
class Vector:
    x: int
    y: int

    def magnitude_sq(self) -> int:
        return self.x ** 2 + self.y ** 2

print(Vector(3, 4).magnitude_sq())`,
    expectedOutputContains: ["25"],
    requiredConstructs: ["@dataclass", "class Vector", "def magnitude_sq"],
    hints: [
      "Decorate class Vector: with @dataclass and declare x: int and y: int.",
      "Add def magnitude_sq(self): return self.x ** 2 + self.y ** 2.",
    ],
    nextStepHint: "Combine static type hints with automated unit assertions.",
  },
  {
    id: "adv-3-type-hints-testing",
    number: 19,
    level: "Advanced",
    title: "Type Hints, Protocols & Automated Testing",
    shortTitle: "Type Hints & Testing",
    duration: "30 min",
    summary:
      "Annotate complex signatures with typing generics and write deterministic unit tests with assert.",
    objectives: [
      "Use TypeVar, Callable, Optional, and Union (|) type annotations",
      "Design self-verifying test suites with boundary and edge-case assertions",
      "Catch regressions early with clear assertion messages",
    ],
    explanation: [
      "Modern Python uses type annotations (list[str], dict[str, int], int | None) to document contracts for IDEs, linters, and teammates.",
      "Writing small, deterministic test functions that assert expected outputs on normal, empty, and boundary inputs is the fastest way to build reliable software.",
    ],
    exampleCode: `def normalize_scores(scores: list[float]) -> list[float]:
    if not scores:
        return []
    peak = max(scores)
    return [round(s / peak, 2) for s in scores] if peak else [0.0 for _ in scores]

assert normalize_scores([50.0, 100.0]) == [0.5, 1.0]
assert normalize_scores([]) == []
print("All unit assertions passed!")`,
    exampleOutput: `All unit assertions passed!`,
    exerciseTitle: "Write & Test a Clamp Function",
    exercisePrompt:
      "Write clamp(val: int, low: int, high: int) -> int that restricts val to [low, high]. Assert clamp(15, 0, 10) == 10 and clamp(-3, 0, 10) == 0, then print 'Tests passed'.",
    starterCode: `def clamp(val: int, low: int, high: int) -> int:
    # Return val clamped between low and high
    pass

assert clamp(15, 0, 10) == 10
assert clamp(-3, 0, 10) == 0
print("Tests passed")`,
    solutionCode: `def clamp(val: int, low: int, high: int) -> int:
    return max(low, min(high, val))

assert clamp(15, 0, 10) == 10
assert clamp(-3, 0, 10) == 0
print("Tests passed")`,
    expectedOutputContains: ["Tests passed"],
    requiredConstructs: ["def clamp", "assert"],
    hints: [
      "Use max(low, min(high, val)) to bound val between low and high.",
      "Keep both assert statements and print('Tests passed').",
    ],
    nextStepHint: "Analyze algorithmic complexity and master classic data structures.",
  },
  {
    id: "adv-4-algorithms-data-structures",
    number: 20,
    level: "Advanced",
    title: "Algorithms, Big-O & Data Structures",
    shortTitle: "Algorithms & Data Structures",
    duration: "40 min",
    summary: "Implement binary search, queues (deque), heaps (heapq), and hash-based O(1) lookups.",
    objectives: [
      "Compare O(1), O(log n), O(n), and O(n^2) time complexities",
      "Use collections.deque for O(1) queue operations and heapq for priority queues",
      "Implement binary search and two-pointer algorithms",
    ],
    explanation: [
      "Choosing the right data structure often speeds up code by orders of magnitude: checking x in my_set is O(1) average time, whereas x in my_list scans linearly in O(n).",
      "For sorted data, binary search (or Python's bisect module) halves the search space on every step, running in O(log n) time.",
    ],
    exampleCode: `import heapq

tasks = [(3, "Write docs"), (1, "Fix critical bug"), (2, "Add unit tests")]
heapq.heapify(tasks)

while tasks:
    priority, name = heapq.heappop(tasks)
    print(f"P{priority}: {name}")`,
    exampleOutput: `P1: Fix critical bug\nP2: Add unit tests\nP3: Write docs`,
    exerciseTitle: "Two-Sum Hash Lookup in O(n)",
    exercisePrompt:
      "Write has_pair_with_sum(nums, target) using a seen set to return True if any two numbers add up to target. Print has_pair_with_sum([2, 7, 11, 15], 9).",
    starterCode: `def has_pair_with_sum(nums: list[int], target: int) -> bool:
    seen = set()
    # Check if target - n is in seen
    pass

print(has_pair_with_sum([2, 7, 11, 15], 9))`,
    solutionCode: `def has_pair_with_sum(nums: list[int], target: int) -> bool:
    seen = set()
    for n in nums:
        if (target - n) in seen:
            return True
        seen.add(n)
    return False

print(has_pair_with_sum([2, 7, 11, 15], 9))`,
    expectedOutputContains: ["True"],
    requiredConstructs: ["seen", "for", "return"],
    hints: [
      "Loop through n in nums. If target - n is in seen, return True.",
      "Otherwise add n to seen with seen.add(n), and return False after the loop.",
    ],
    nextStepHint: "Next, coordinate concurrent I/O workloads using asynchronous Python.",
  },
  {
    id: "adv-5-async-python",
    number: 21,
    level: "Advanced",
    title: "Asynchronous Python (async / await)",
    shortTitle: "Asynchronous Python",
    duration: "35 min",
    summary:
      "Write non-blocking coroutines, schedule concurrent tasks with asyncio.gather, and handle timeouts.",
    objectives: [
      "Understand the event loop and cooperative multitasking with async def and await",
      "Run multiple I/O tasks concurrently with asyncio.gather()",
      "Avoid blocking the event loop with synchronous calls",
    ],
    explanation: [
      "Asynchronous programming lets a single Python thread manage thousands of concurrent network or I/O operations by yielding control at await points while waiting for responses.",
      "Functions defined with async def return coroutine objects that are awaited inside an event loop.",
    ],
    exampleCode: `import asyncio

async def fetch_module(module_id: int) -> str:
    await asyncio.sleep(0.01)
    return f"Module-{module_id}"

async def main():
    results = await asyncio.gather(fetch_module(1), fetch_module(2), fetch_module(3))
    print("Loaded concurrently:", ", ".join(results))

await main()`,
    exampleOutput: `Loaded concurrently: Module-1, Module-2, Module-3`,
    exerciseTitle: "Write an Async Coroutine",
    exercisePrompt:
      "Define an async function compute_async(x) that returns x * 10, and print the result of awaiting compute_async(7).",
    starterCode: `import asyncio

async def compute_async(x: int) -> int:
    # Return x * 10
    return x * 10

print(await compute_async(7))`,
    solutionCode: `import asyncio

async def compute_async(x: int) -> int:
    return x * 10

print(await compute_async(7))`,
    expectedOutputContains: ["70"],
    requiredConstructs: ["async def compute_async"],
    hints: [
      "Implement async def compute_async(x: int) -> int: return x * 10.",
      "Ensure running the script prints 70.",
    ],
    nextStepHint: "Profile bottlenecks and optimize memory and CPU performance.",
  },
  {
    id: "adv-6-performance-debugging",
    number: 22,
    level: "Advanced",
    title: "Performance Profiling, Caching & Debugging",
    shortTitle: "Performance & Caching",
    duration: "30 min",
    summary:
      "Eliminate redundant computation with functools.lru_cache, measure timing, and optimize memory.",
    objectives: [
      "Memoize expensive recursive or pure functions with @lru_cache",
      "Measure execution speed with time.perf_counter()",
      "Understand algorithmic vs constant-factor optimizations",
    ],
    explanation: [
      "Recursive algorithms like Fibonacci or dynamic programming often recompute the same subproblems exponentially many times.",
      "Adding @functools.lru_cache(maxsize=None) caches previous results by argument tuple, turning an O(2^n) recursive function into O(n) instantly.",
    ],
    exampleCode: `from functools import lru_cache

@lru_cache(maxsize=None)
def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    return climb_stairs(n - 1) + climb_stairs(n - 2)

print("Ways to climb 10 stairs:", climb_stairs(10))
print("Cache info:", climb_stairs.cache_info().hits > 0)`,
    exampleOutput: `Ways to climb 10 stairs: 89\nCache info: True`,
    exerciseTitle: "Memoize Tribonacci with lru_cache",
    exercisePrompt:
      "Decorate trib(n) with @lru_cache(maxsize=None) where trib(0)=0, trib(1)=1, trib(2)=1, and trib(n)=trib(n-1)+trib(n-2)+trib(n-3). Print trib(10).",
    starterCode: `from functools import lru_cache

@lru_cache(maxsize=None)
def trib(n: int) -> int:
    # Base cases for 0, 1, 2 and recursive sum
    pass

print(trib(10))`,
    solutionCode: `from functools import lru_cache

@lru_cache(maxsize=None)
def trib(n: int) -> int:
    if n == 0:
        return 0
    if n <= 2:
        return 1
    return trib(n - 1) + trib(n - 2) + trib(n - 3)

print(trib(10))`,
    expectedOutputContains: ["149"],
    requiredConstructs: ["@lru_cache", "def trib"],
    hints: [
      "Return 0 if n == 0, return 1 if n <= 2.",
      "Otherwise return trib(n - 1) + trib(n - 2) + trib(n - 3), then print(trib(10)).",
    ],
    nextStepHint: "Design clean API boundaries and service architectures.",
  },
  {
    id: "adv-7-apis-architecture",
    number: 23,
    level: "Advanced",
    title: "APIs, Data Validation & Application Architecture",
    shortTitle: "APIs & Architecture",
    duration: "35 min",
    summary:
      "Design clean request/response schemas, layered service patterns, and resilient error contracts.",
    objectives: [
      "Separate domain logic from transport/HTTP serialization",
      "Validate untrusted payloads and return structured response envelopes",
      "Implement retry/backoff and rate-limiting patterns",
    ],
    explanation: [
      "Production Python backends separate concerns into three layers: Transport (routing & status codes), Service/Domain (business rules), and Repository (database or external API calls).",
      "Validating input payloads at the boundary ensures internal functions always operate on trusted, well-typed objects.",
    ],
    exampleCode: `def handle_enroll_request(payload: dict) -> dict:
    student = str(payload.get("student", "")).strip()
    track = payload.get("track")
    if not student or track not in {"Beginner", "Intermediate", "Advanced"}:
        return {"status": 400, "error": "Invalid enrollment payload"}
    return {"status": 200, "data": {"student": student, "track": track, "enrolled": True}}

print(handle_enroll_request({"student": "Naomi", "track": "Advanced"}))`,
    exampleOutput: `{'status': 200, 'data': {'student': 'Naomi', 'track': 'Advanced', 'enrolled': True}}`,
    exerciseTitle: "Validate an API Request Payload",
    exercisePrompt:
      "Write validate_score_payload(data: dict) -> bool that returns True only if 'username' is a non-empty string and 'score' is an int between 0 and 100 inclusive. Print validate_score_payload({'username': 'naomi', 'score': 95}).",
    starterCode: `def validate_score_payload(data: dict) -> bool:
    # Check username and score constraints
    pass

print(validate_score_payload({"username": "naomi", "score": 95}))`,
    solutionCode: `def validate_score_payload(data: dict) -> bool:
    u = data.get("username")
    s = data.get("score")
    return isinstance(u, str) and len(u.strip()) > 0 and isinstance(s, int) and 0 <= s <= 100

print(validate_score_payload({"username": "naomi", "score": 95}))`,
    expectedOutputContains: ["True"],
    requiredConstructs: ["def validate_score_payload", "return"],
    hints: [
      "Check isinstance(data.get('username'), str) and bool(data['username'].strip()).",
      "Check 0 <= data.get('score', -1) <= 100 and return True.",
    ],
    nextStepHint: "Complete the curriculum with the Advanced AI & Python Capstone Project!",
  },
  {
    id: "adv-8-capstone-project",
    number: 24,
    level: "Advanced",
    title: "Advanced Capstone: Mini Prompt & Token Pipeline",
    shortTitle: "AI Pipeline Capstone",
    duration: "45 min",
    summary:
      "Architect a complete Python text tokenizer, TF-score ranker, and structured prompt builder.",
    objectives: [
      "Build a modular text preprocessing and tokenization pipeline",
      "Score document relevance against a user query",
      "Assemble context-grounded prompts for AI agents",
    ],
    explanation: [
      "Modern AI engineering relies heavily on clean Python pipelines: normalizing documents, scoring relevant context chunks (Retrieval-Augmented Generation), and formatting deterministic prompts.",
      "In this final capstone, you will build a lightweight retrieval scorer that selects the best knowledge chunk for a student's question.",
    ],
    exampleCode: `def retrieve_best_doc(query: str, docs: list[str]) -> str:
    q_tokens = set(query.lower().split())
    scored = []
    for doc in docs:
        d_tokens = set(doc.lower().split())
        overlap = len(q_tokens & d_tokens)
        scored.append((overlap, doc))
    scored.sort(reverse=True)
    return scored[0][1]

kb = [
    "Lists store ordered mutable sequences in Python",
    "Decorators wrap functions to extend behavior",
    "Asyncio manages concurrent coroutines with await",
]
print("Retrieved:", retrieve_best_doc("how do decorators wrap functions", kb))`,
    exampleOutput: `Retrieved: Decorators wrap functions to extend behavior`,
    exerciseTitle: "Token Overlap Scorer",
    exercisePrompt:
      "Write overlap_score(a: str, b: str) -> int that returns the number of shared lowercase words between strings a and b. Print overlap_score('Python AI Academy', 'learn python and ai today').",
    starterCode: `def overlap_score(a: str, b: str) -> int:
    # Return count of shared lowercase words
    pass

print(overlap_score("Python AI Academy", "learn python and ai today"))`,
    solutionCode: `def overlap_score(a: str, b: str) -> int:
    return len(set(a.lower().split()) & set(b.lower().split()))

print(overlap_score("Python AI Academy", "learn python and ai today"))`,
    expectedOutputContains: ["2"],
    requiredConstructs: ["def overlap_score", "lower", "split"],
    hints: [
      "Convert both strings to lowercase sets of words: set(a.lower().split()).",
      "Use the set intersection operator & and return len(...).",
    ],
    nextStepHint:
      "You have mastered all 24 NaomiLearn modules across Beginner, Intermediate, and Advanced!",
  },
];

export const CURATED_QUIZ_BANK: QuizQuestion[] = [
  // Beginner Questions
  {
    id: "q-beg-1",
    level: "Beginner",
    module: "Setup & First Program",
    question:
      'What does the following Python code output?\n\n```python\n# print("Hidden")\nprint("Hello", 3 + 4)\n```',
    options: ["Hello 7", "Hello 3 + 4", "Hidden Hello 7", "SyntaxError"],
    answerIndex: 0,
    explanation:
      "The first line is a comment (`#`), so Python ignores it. On the second line, `3 + 4` evaluates to `7`, and `print()` separates multiple arguments with a space: `Hello 7`.",
  },
  {
    id: "q-beg-2",
    level: "Beginner",
    module: "Variables & Data Types",
    question: "Which expression correctly uses an f-string to display the variable `score = 95`?",
    options: [
      'f"Your score is {score}"',
      '"Your score is {score}"',
      'f"Your score is (score)"',
      'str("Your score is $score")',
    ],
    answerIndex: 0,
    explanation:
      "Prefixing a string literal with `f` lets you interpolate Python expressions inside curly braces `{score}`.",
  },
  {
    id: "q-beg-3",
    level: "Beginner",
    module: "Variables & Data Types",
    question: "What is the data type of `result` after running `result = 10 / 2` in Python 3?",
    options: ["float (5.0)", "int (5)", "str ('5')", "bool (True)"],
    answerIndex: 0,
    explanation:
      "In Python 3, standard division `/` always returns a `float` (`5.0`), even when the numbers divide evenly. Use `//` for integer floor division.",
  },
  {
    id: "q-beg-4",
    level: "Beginner",
    module: "Input/Output & Operators",
    question: "What are the values of `a` and `b` after executing `a = 17 // 5` and `b = 17 % 5`?",
    options: ["a = 3, b = 2", "a = 3.4, b = 2", "a = 2, b = 3", "a = 3, b = 5"],
    answerIndex: 0,
    explanation:
      "`17 // 5` performs floor division yielding the quotient `3`, while `17 % 5` returns the remainder `2`.",
  },
  {
    id: "q-beg-5",
    level: "Beginner",
    module: "Conditionals (if/else)",
    question:
      'What will be printed when `x = 15`?\n\n```python\nif x > 20:\n    print("A")\nelif x > 10:\n    print("B")\nelif x > 5:\n    print("C")\nelse:\n    print("D")\n```',
    options: ["B", "B and C", "A", "C"],
    answerIndex: 0,
    explanation:
      "In an `if/elif/else` chain, Python executes only the first branch whose condition evaluates to `True` (`x > 10`) and skips the remaining `elif`/`else` blocks.",
  },
  {
    id: "q-beg-6",
    level: "Beginner",
    module: "Loops",
    question: "Which numbers are generated by `list(range(2, 9, 3))`?",
    options: ["[2, 5, 8]", "[2, 5, 8, 11]", "[2, 3, 9]", "[3, 6, 9]"],
    answerIndex: 0,
    explanation:
      "`range(start, stop, step)` starts at `2` and adds `3` each step (`2, 5, 8`), stopping before `9`.",
  },
  {
    id: "q-beg-7",
    level: "Beginner",
    module: "Collections & Dictionaries",
    question: "What does `len(set([1, 2, 2, 3, 3, 3]))` evaluate to?",
    options: ["3", "6", "1", "TypeError"],
    answerIndex: 0,
    explanation:
      "Converting a list to a `set` automatically removes duplicate values, leaving `{1, 2, 3}` which has length `3`.",
  },
  {
    id: "q-beg-8",
    level: "Beginner",
    module: "Functions",
    question:
      "What happens if a Python function finishes running without hitting a `return` statement?",
    options: [
      "It implicitly returns None",
      "It raises a RuntimeError",
      "It returns 0",
      "It returns the last variable assigned",
    ],
    answerIndex: 0,
    explanation:
      "Every Python function returns a value; if no explicit `return` statement is executed, Python automatically returns `None`.",
  },
  {
    id: "q-beg-9",
    level: "Beginner",
    module: "Debugging & Mini Project",
    question:
      "Which exception is raised when accessing `items[5]` on a list `items = ['a', 'b', 'c']`?",
    options: ["IndexError", "KeyError", "ValueError", "TypeError"],
    answerIndex: 0,
    explanation:
      "Accessing a sequence index outside its valid range (`0` to `len(items) - 1`) raises an `IndexError`.",
  },

  // Intermediate Questions
  {
    id: "q-int-1",
    level: "Intermediate",
    module: "Strings & Collections",
    question: 'What does `"naomilearn"[::-1]` return?',
    options: ['"nraelimoan"', '"naomilearn"', '"n"', "IndexError"],
    answerIndex: 0,
    explanation:
      "A slice with step `-1` (`[::-1]`) traverses the sequence from right to left, returning the reversed string.",
  },
  {
    id: "q-int-2",
    level: "Intermediate",
    module: "Modules & *args/**kwargs",
    question:
      "Inside `def log_event(event, *tags, **meta):`, what are the data types of `tags` and `meta`?",
    options: [
      "tags is a tuple, meta is a dict",
      "tags is a list, meta is a dict",
      "tags is a set, meta is a list",
      "Both are dictionaries",
    ],
    answerIndex: 0,
    explanation:
      "`*args` collects extra positional arguments into an immutable `tuple`, while `**kwargs` collects keyword arguments into a `dict`.",
  },
  {
    id: "q-int-3",
    level: "Intermediate",
    module: "File Handling & JSON",
    question:
      "Why is `with open('data.json') as f:` preferred over calling `f = open('data.json')` manually?",
    options: [
      "The context manager automatically closes the file even if an exception occurs",
      "It loads the entire file into GPU memory automatically",
      "It parses JSON without importing the json module",
      "It prevents syntax errors inside the file",
    ],
    answerIndex: 0,
    explanation:
      "Context managers (`with`) invoke `__exit__` automatically when leaving the block, ensuring file descriptors are always released cleanly.",
  },
  {
    id: "q-int-4",
    level: "Intermediate",
    module: "Exceptions (try/except)",
    question: "In a `try / except / else / finally` block, when does the `else` block execute?",
    options: [
      "Only when the try block completes with no exceptions raised",
      "Only when an exception is caught by except",
      "Always, regardless of whether an exception occurred",
      "Only when finally raises an error",
    ],
    answerIndex: 0,
    explanation:
      "The `else` clause runs only if the `try` block succeeded without raising an exception, while `finally` runs in all cases.",
  },
  {
    id: "q-int-5",
    level: "Intermediate",
    module: "Object-Oriented Programming",
    question: "What is the purpose of the `@property` decorator inside a Python class?",
    options: [
      "It allows a method to be accessed like an attribute with computed getter logic",
      "It makes the class impossible to subclass",
      "It converts an instance method into a global function",
      "It deletes all private attributes automatically",
    ],
    answerIndex: 0,
    explanation:
      "`@property` lets you expose a method as a managed attribute so callers write `obj.value` while executing validation or calculation logic under the hood.",
  },
  {
    id: "q-int-6",
    level: "Intermediate",
    module: "Iterators & Comprehensions",
    question:
      "What is the result of `{w: len(w) for w in ['ai', 'code', 'python'] if len(w) > 2}`?",
    options: [
      "{'code': 4, 'python': 6}",
      "{'ai': 2, 'code': 4, 'python': 6}",
      "[4, 6]",
      "{'code', 'python'}",
    ],
    answerIndex: 0,
    explanation:
      "This dictionary comprehension filters out `'ai'` (since `len('ai')` is 2) and maps the remaining words to their lengths.",
  },
  {
    id: "q-int-7",
    level: "Intermediate",
    module: "Standard Library",
    question: "What does `re.findall(r'\\d+', 'Order 12 has 3 items')` return?",
    options: ["['12', '3']", "[12, 3]", "'123'", "['1', '2', '3']"],
    answerIndex: 0,
    explanation:
      "`\\d+` matches one or more contiguous digits, and `re.findall` returns a list of matching substrings: `['12', '3']`.",
  },
  {
    id: "q-int-8",
    level: "Intermediate",
    module: "Practical Project",
    question: "What does `counts.get('python', 0)` return if `'python'` is not a key in `counts`?",
    options: ["0", "None", "KeyError", "False"],
    answerIndex: 0,
    explanation:
      "`dict.get(key, default)` safely returns `default` (`0`) instead of raising a `KeyError` when `key` is missing.",
  },

  // Advanced Questions
  {
    id: "q-adv-1",
    level: "Advanced",
    module: "Decorators & Generators",
    question: "What happens when you call a Python function that contains the `yield` keyword?",
    options: [
      "It immediately returns a generator iterator object without executing the body yet",
      "It runs the entire loop and returns a list of all yielded values",
      "It spawns a background OS thread",
      "It raises StopIteration immediately",
    ],
    answerIndex: 0,
    explanation:
      "Calling a generator function returns a lazy generator object. Its body only executes step by step as `next()` or a `for` loop consumes values.",
  },
  {
    id: "q-adv-2",
    level: "Advanced",
    module: "Advanced OOP Design",
    question: "What does `@dataclass(frozen=True)` enforce on instances of the decorated class?",
    options: [
      "Instances become immutable (assigning to fields raises FrozenInstanceError) and hashable",
      "The class cannot have any methods defined on it",
      "All fields are converted to strings at runtime",
      "Instances are automatically serialized to disk",
    ],
    answerIndex: 0,
    explanation:
      "`frozen=True` prevents attribute mutation after initialization and generates a `__hash__` method so instances can be used as dictionary keys or set members.",
  },
  {
    id: "q-adv-3",
    level: "Advanced",
    module: "Type Hints & Testing",
    question:
      "In Python 3.10+, what does the type annotation `def find_user(uid: int) -> dict[str, str] | None:` signify?",
    options: [
      "The function accepts an int and returns either a dict mapping strings to strings, or None",
      "The function performs a bitwise OR between a dictionary and None at runtime",
      "Python will automatically cast the return value to None if an exception occurs",
      "The parameter uid is optional",
    ],
    answerIndex: 0,
    explanation:
      "The union operator `|` in type annotations indicates that the return value may be either `dict[str, str]` or `None`.",
  },
  {
    id: "q-adv-4",
    level: "Advanced",
    module: "Algorithms & Data Structures",
    question: "Why is `collections.deque.popleft()` preferred over `list.pop(0)` for FIFO queues?",
    options: [
      "deque.popleft() runs in O(1) time whereas list.pop(0) shifts all remaining elements in O(n) time",
      "list.pop(0) removes the last element instead of the first",
      "deque automatically sorts elements in ascending order",
      "deque uses zero memory for elements",
    ],
    answerIndex: 0,
    explanation:
      "Python lists are contiguous arrays, so removing index `0` requires shifting `n - 1` references. `deque` is a doubly-linked block structure with O(1) appends and pops at both ends.",
  },
  {
    id: "q-adv-5",
    level: "Advanced",
    module: "Asynchronous Python",
    question:
      "Which `asyncio` function schedules multiple coroutines concurrently and waits for all of them to finish?",
    options: [
      "await asyncio.gather(coro1(), coro2())",
      "asyncio.sleep(coro1(), coro2())",
      "await asyncio.Sequential(coro1, coro2)",
      "yield from asyncio.lock()",
    ],
    answerIndex: 0,
    explanation:
      "`asyncio.gather(*aws)` schedules all passed awaitables concurrently on the event loop and resolves to a list of their results in order.",
  },
  {
    id: "q-adv-6",
    level: "Advanced",
    module: "Performance & Caching",
    question:
      "What requirement must arguments to a function decorated with `@functools.lru_cache` satisfy?",
    options: [
      "All arguments must be hashable (e.g., ints, strings, tuples—not mutable lists or dicts)",
      "All arguments must be floating-point numbers",
      "The function must take zero arguments",
      "The function must be an async coroutine",
    ],
    answerIndex: 0,
    explanation:
      "`lru_cache` stores call results in an internal dictionary keyed by the argument tuple, so every argument must be hashable.",
  },
  {
    id: "q-adv-7",
    level: "Advanced",
    module: "APIs & Architecture",
    question:
      "Why does `isinstance(True, int)` evaluate to `True` in Python when validating JSON payloads?",
    options: [
      "In Python, bool is a subclass of int (True == 1 and False == 0)",
      "It is a bug in the JSON parser",
      "isinstance() only checks if an object is truthy",
      "int is a subclass of str",
    ],
    answerIndex: 0,
    explanation:
      "Because `bool` inherits from `int` in Python, strict integer validators often check `isinstance(x, int) and not isinstance(x, bool)`.",
  },
  {
    id: "q-adv-8",
    level: "Advanced",
    module: "AI Pipeline Capstone",
    question:
      "Given two token sets `q = {'python', 'async'}` and `d = {'python', 'await', 'async'}`, what is the Jaccard similarity `len(q & d) / len(q | d)`?",
    options: ["2 / 3 (approx 0.67)", "1.0", "1 / 3 (approx 0.33)", "2 / 5 (0.4)"],
    answerIndex: 0,
    explanation:
      "The intersection `q & d` has 2 tokens (`{'python', 'async'}`) and the union `q | d` has 3 tokens (`{'python', 'async', 'await'}`), giving `2 / 3`.",
  },
];

export function getLessonsByLevel(level?: LearningLevel): LessonModule[] {
  if (!level) return CURRICULUM_LESSONS;
  return CURRICULUM_LESSONS.filter((l) => l.level === level);
}

export function getLessonByIdOrTitle(idOrTitle: string): LessonModule | undefined {
  const q = idOrTitle.toLowerCase().trim();
  return CURRICULUM_LESSONS.find(
    (l) =>
      l.id.toLowerCase() === q ||
      l.title.toLowerCase() === q ||
      l.shortTitle.toLowerCase() === q ||
      l.title.toLowerCase().includes(q) ||
      l.shortTitle.toLowerCase().includes(q),
  );
}

export function getCuratedQuizzes(level?: LearningLevel, moduleName?: string): QuizQuestion[] {
  return CURATED_QUIZ_BANK.filter((q) => {
    const levelMatch = !level || q.level === level;
    const modMatch =
      !moduleName ||
      moduleName === "All Topics" ||
      q.module.toLowerCase().includes(moduleName.toLowerCase()) ||
      moduleName.toLowerCase().includes(q.module.toLowerCase());
    return levelMatch && modMatch;
  });
}
