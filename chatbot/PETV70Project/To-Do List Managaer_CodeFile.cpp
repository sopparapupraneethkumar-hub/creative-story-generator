#include <iostream>
#include <string>
#include <fstream>
using namespace std;

int globalId = 1;

struct Task {
    int id;
    string name;
    string dueDate;
    int priority;
    bool completed;
    Task* next;
};

class ToDoList {
private:
    Task* head;

public:
    ToDoList() {
        head = nullptr;
    }

    void addTask(string name, string dueDate, int priority) {
        Task* newTask = new Task{globalId++, name, dueDate, priority, false, nullptr};
        if (!head) {
            head = newTask;
        } else {
            Task* temp = head;
            while (temp->next) temp = temp->next;
            temp->next = newTask;
        }
        cout << " Task added successfully.\n";
    }

    void deleteTask(int id) {
        if (!head) {
            cout << " List is empty.\n";
            return;
        }
        if (head->id == id) {
            Task* toDelete = head;
            head = head->next;
            delete toDelete;
            cout << " Task deleted successfully.\n";
            return;
        }
        Task* temp = head;
        while (temp->next && temp->next->id != id) {
            temp = temp->next;
        }
        if (temp->next) {
            Task* toDelete = temp->next;
            temp->next = temp->next->next;
            delete toDelete;
            cout << " Task deleted successfully.\n";
        } else {
            cout << " Task ID not found.\n";
        }
    }

    void markCompleted(int id) {
        Task* temp = head;
        while (temp) {
            if (temp->id == id) {
                temp->completed = true;
                cout << " Task marked as completed.\n";
                return;
            }
            temp = temp->next;
        }
        cout << " Task ID not found.\n";
    }

    void updateTask(int id) {
        Task* temp = head;
        while (temp) {
            if (temp->id == id) {
                cout << "Enter new task name: ";
                getline(cin, temp->name);
                cout << "Enter new due date: ";
                getline(cin, temp->dueDate);
                cout << "Enter new priority (1-5): ";
                cin >> temp->priority;
                cin.ignore();
                cout << " Task updated successfully.\n";
                return;
            }
            temp = temp->next;
        }
        cout << " Task ID not found.\n";
    }

    void displayTasks(bool showCompletedOnly = false, bool showPendingOnly = false) {
        if (!head) {
            cout << " No tasks to display.\n";
            return;
        }
        Task* temp = head;
        cout << "\n--- TO-DO LIST ---\n";
        while (temp) {
            if ((showCompletedOnly && !temp->completed) || (showPendingOnly && temp->completed)) {
                temp = temp->next;
                continue;
            }
            cout << "ID: " << temp->id
                 << " | Task: " << temp->name
                 << " | Due: " << temp->dueDate
                 << " | Priority: " << temp->priority
                 << " | Completed: " << (temp->completed ? "Yes" : "No") << endl;
            temp = temp->next;
        }
        cout << "-------------------\n";
    }

    void searchTask(string keyword) {
        Task* temp = head;
        bool found = false;
        while (temp) {
            if (temp->name.find(keyword) != string::npos) {
                cout << " Found Task - ID: " << temp->id << ", Name: " << temp->name << "\n";
                found = true;
            }
            temp = temp->next;
        }
        if (!found) cout << " No matching tasks found.\n";
    }

    void saveToFile(string filename = "tasks.txt") {
        ofstream file(filename);
        Task* temp = head;
        while (temp) {
            file << temp->id << "," << temp->name << "," << temp->dueDate << ","
                 << temp->priority << "," << temp->completed << "\n";
            temp = temp->next;
        }
        file.close();
        cout << " Tasks saved to file.\n";
    }

    void loadFromFile(string filename = "tasks.txt") {
        ifstream file(filename);
        if (!file.is_open()) return;

        string name, dueDate;
        int id, priority;
        bool completed;
        char delim;

        while (file >> id >> delim) {
            getline(file, name, ',');
            getline(file, dueDate, ',');
            file >> priority >> delim >> completed;
            file.ignore();

            Task* newTask = new Task{id, name, dueDate, priority, completed, nullptr};
            if (!head) head = newTask;
            else {
                Task* temp = head;
                while (temp->next) temp = temp->next;
                temp->next = newTask;
            }
            if (id >= globalId) globalId = id + 1;
        }
        file.close();
        cout << " Tasks loaded from file.\n";
    }

    ~ToDoList() {
        while (head) {
            Task* temp = head;
            head = head->next;
            delete temp;
        }
    }
};

int main() {
    ToDoList list;
    list.loadFromFile();  // Load saved tasks if any

    int choice, id, priority;
    string name, dueDate, keyword;

    do {
        cout << "\n TO-DO LIST MENU \n";
        cout << "1. Add Task\n";
        cout << "2. Delete Task\n";
        cout << "3. Mark Task as Completed\n";
        cout << "4. Display All Tasks\n";
        cout << "5. Display Completed Tasks\n";
        cout << "6. Display Pending Tasks\n";
        cout << "7. Search Task by Name\n";
        cout << "8. Update Task\n";
        cout << "9. Save Tasks\n";
        cout << "10. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;
        cin.ignore();

        switch (choice) {
            case 1:
                cout << "Enter task name: "; getline(cin, name);
                cout << "Enter due date: "; getline(cin, dueDate);
                cout << "Enter priority (1-5): "; cin >> priority; cin.ignore();
                list.addTask(name, dueDate, priority);
                break;
            case 2:
                cout << "Enter task ID to delete: "; cin >> id; cin.ignore();
                list.deleteTask(id);
                break;
            case 3:
                cout << "Enter task ID to mark as completed: "; cin >> id; cin.ignore();
                list.markCompleted(id);
                break;
            case 4:
                list.displayTasks();
                break;
            case 5:
                list.displayTasks(true, false);
                break;
            case 6:
                list.displayTasks(false, true);
                break;
            case 7:
                cout << "Enter keyword to search: "; getline(cin, keyword);
                list.searchTask(keyword);
                break;
            case 8:
                cout << "Enter task ID to update: "; cin >> id; cin.ignore();
                list.updateTask(id);
                break;
            case 9:
                list.saveToFile();
                break;
            case 10:
                cout << " Exiting... Goodbye!\n";
                break;
            default:
                cout << " Invalid choice. Try again.\n";
        }

    } while (choice != 10);

    return 0;
}
