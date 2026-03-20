#include <iostream>
#include <vector>

// Функция для подсчета суммы чисел в векторе
int sum(const std::vector<int>& numbers) {
    int total = 0;
    for (int n : numbers) {
        total += n;
    }
    return total;
}

// Функция для подсчета среднего значения
double average(const std::vector<int>& numbers) {
    if (numbers.empty()) return 0.0;
    return static_cast<double>(sum(numbers)) / numbers.size();
}

int main() {
    std::vector<int> numbers;
    int num;

    std::cout << "Введите числа (0 для завершения): " << std::endl;

    while (true) {
        std::cin >> num;
        if (num == 0) break;
        numbers.push_back(num);
    }

    std::cout << "Сумма: " << sum(numbers) << std::endl;
    std::cout << "Среднее: " << average(numbers) << std::endl;

    return 0;
}