from django.shortcuts import render,redirect,get_object_or_404
from .forms import StudentForm,SubjectForm,StudentMarkForm
from .models import Student,Subject,StudentMark
from .utils import calculate_student_result
from django.db.models import Avg
# Create your views here.

def dashboard(request):
    students = Student.objects.all()
    total_students = students.count()
    passed_students = 0
    failed_students = 0
    incomplete_students = 0
    completed_percentages = []
    student_results = []
    for student in students:
        result = calculate_student_result(student)
        if result['result'] == 'Pass':
            passed_students += 1
        elif result['result'] == 'Fail':
            failed_students += 1
        else:
            incomplete_students += 1
        if result['percentage'] is not None:
            completed_percentages.append(result['percentage'])
            student_results.append({
                'student': student,
                'percentage': result['percentage'],
                'result': result['result']
            })
    # Calculate class average
    if completed_percentages:
        class_average = round(
            sum(completed_percentages) / len(completed_percentages), 2
        )
    else:
        class_average = 0

    
    # Calculate subject-wise average performance
    subjects = Subject.objects.all()

    subject_performance = []

    for subject in subjects:

        average_marks = StudentMark.objects.filter(
            subject=subject
        ).aggregate(
            avg_marks=Avg('marks_obtained')
        )['avg_marks']

        if average_marks is not None and subject.max_marks > 0:

            average_percentage = round(
                (average_marks / subject.max_marks) * 100, 2
            )

            subject_performance.append({
                'subject': subject.name,
                'average': average_percentage
            })

    # Get top five students
    top_students = sorted(
        student_results,
        key=lambda item: item['percentage'],
        reverse=True
    )[:5]
    context = {
        'total_students': total_students,
        'passed_students': passed_students,
        'failed_students': failed_students,
        'incomplete_students': incomplete_students,
        'class_average': class_average,
        'subject_performance': subject_performance,
        'top_students': top_students,
    }
    return render(request, 'dashboard.html', context)

def home(request):
    return render(request, 'home.html')

def add_student(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = StudentForm()
    return render(request, 'add_student.html', {'form': form})


def edit_student(request, id):
    student = get_object_or_404(Student, id=id)
    if request.method == 'POST':
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            return redirect('student_detail', id=student.id)
    else:
        form = StudentForm(instance=student)
    return render(request, 'edit_student.html', {
        'form': form,
        'student': student
    })


def delete_student(request, id):
    student = get_object_or_404(Student, id=id)
    if request.method == 'POST':
        student.delete()
        return redirect('student_list')
    return render(request, 'delete_student.html', {
        'student': student
    })


def add_subject(request):
    if request.method == 'POST':
        form = SubjectForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = SubjectForm()
    return render(request, 'add_subject.html', {'form': form})

def student_list(request):
    students = Student.objects.all()
    return render(request, 'student_list.html', {
        'students': students
    })


def student_detail(request, id):
    student = get_object_or_404(Student, id=id)
    result = calculate_student_result(student)

    return render(request, 'student_detail.html', {
        'student': student,
        'result': result
    })


def add_student_mark(request, id):
    student = get_object_or_404(Student, id=id)

    if request.method == 'POST':
        form = StudentMarkForm(request.POST)

        if form.is_valid():
            mark = form.save(commit=False)
            mark.student = student
            mark.save()
            return redirect('student_detail', id=student.id)

    else:
        form = StudentMarkForm()

    return render(request, 'add_mark.html', {
        'form': form,
        'student': student
    })


def edit_student_mark(request, student_id, mark_id):
    student = get_object_or_404(Student, id=student_id)

    mark = get_object_or_404(
        StudentMark,
        id=mark_id,
        student=student
    )

    if request.method == 'POST':
        form = StudentMarkForm(request.POST, instance=mark)

        if form.is_valid():
            form.save()
            return redirect('student_detail', id=student.id)

    else:
        form = StudentMarkForm(instance=mark)

    return render(request, 'edit_mark.html', {
        'form': form,
        'student': student,
        'mark': mark
    })


def delete_student_mark(request, student_id, mark_id):
    student = get_object_or_404(Student, id=student_id)

    mark = get_object_or_404(
        StudentMark,
        id=mark_id,
        student=student
    )

    if request.method == 'POST':
        mark.delete()
        return redirect('student_detail', id=student.id)

    return render(request, 'delete_mark.html', {
        'student': student,
        'mark': mark
    })
