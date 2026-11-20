
from .models import Subject


def calculate_student_result(student):

    marks = student.marks.select_related('subject').all()

    marks_by_subject = {
        mark.subject_id: mark for mark in marks
    }

    subjects = Subject.objects.all()

    subject_results = []

    total_obtained = 0
    total_maximum = 0
    failed_subjects = False
    completed_subjects = 0
    absent_subjects = 0

    for subject in subjects:

        total_maximum += subject.max_marks

        mark = marks_by_subject.get(subject.id)

        if mark is None:
            subject_results.append({
                'subject': subject.name,
                'marks_obtained': None,
                'max_marks': subject.max_marks,
                'grade': '-',
                'result': 'Pending'
            })
            continue

        completed_subjects += 1

        # Check attendance status
        if mark.status == 'Absent':

            absent_subjects += 1
            failed_subjects = True

            subject_results.append({
                'mark_id': mark.id,
                'subject': subject.name,
                'marks_obtained': None,
                'max_marks': subject.max_marks,
                'grade': 'F',
                'result': 'Absent - Fail'
            })

            continue

        obtained = mark.marks_obtained
        total_obtained += obtained

        percentage = (obtained / subject.max_marks) * 100

        if percentage >= 90:
            grade = 'A+'
        elif percentage >= 80:
            grade = 'A'
        elif percentage >= 70:
            grade = 'B+'
        elif percentage >= 60:
            grade = 'B'
        elif percentage >= 50:
            grade = 'C+'
        elif percentage >= 35:
            grade = 'C'
        else:
            grade = 'F'

        if obtained < subject.pass_marks:
            result = 'Fail'
            failed_subjects = True
        else:
            result = 'Pass'

        subject_results.append({
            'mark_id': mark.id,
            'subject': subject.name,
            'marks_obtained': obtained,
            'max_marks': subject.max_marks,
            'grade': grade,
            'result': result
        })

    # Calculate overall percentage
    if total_maximum > 0 and completed_subjects > 0:
        percentage = round(
            (total_obtained / total_maximum) * 100, 2
        )
    else:
        percentage = None

    # Determine overall result
    if failed_subjects:
        final_result = 'Fail'
    elif completed_subjects < subjects.count():
        final_result = 'Incomplete'
        percentage = None
    else:
        final_result = 'Pass'

    return {
        'subject_results': subject_results,
        'total_obtained': total_obtained,
        'total_maximum': total_maximum,
        'percentage': percentage,
        'result': final_result
    }
