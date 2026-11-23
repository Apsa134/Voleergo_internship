
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
    pending_subjects = 0

    for subject in subjects:

        total_maximum += subject.max_marks

        mark = marks_by_subject.get(subject.id)

        # Check whether marks are available
        if mark is None or (
            mark.status == 'Present' and mark.marks_obtained is None
        ):
            pending_subjects += 1

            subject_results.append({
                'mark_id': mark.id if mark else None,
                'subject': subject.name,
                'marks_obtained': None,
                'max_marks': subject.max_marks,
                'grade': '-',
                'result': 'Pending'
            })

            continue

        completed_subjects += 1

        # Handle absent students
        if mark.status == 'Absent':

            failed_subjects = True

            # Absent contributes zero marks
            subject_results.append({
                'mark_id': mark.id,
                'subject': subject.name,
                'marks_obtained': 0,
                'max_marks': subject.max_marks,
                'grade': 'F',
                'result': 'Absent - Fail'
            })

            continue

        obtained = mark.marks_obtained
        total_obtained += obtained

        # Calculate subject percentage safely
        if subject.max_marks > 0:
            subject_percentage = (
                obtained / subject.max_marks
            ) * 100
        else:
            subject_percentage = 0

        # Calculate grade
        if subject_percentage >= 90:
            grade = 'A+'
        elif subject_percentage >= 80:
            grade = 'A'
        elif subject_percentage >= 70:
            grade = 'B+'
        elif subject_percentage >= 60:
            grade = 'B'
        elif subject_percentage >= 50:
            grade = 'C+'
        elif subject_percentage >= 35:
            grade = 'C'
        else:
            grade = 'F'

        # Check pass or fail
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

    # Calculate overall percentage only when all subjects are completed
    if (
        total_maximum > 0
        and pending_subjects == 0
        and completed_subjects > 0
    ):
        percentage = round(
            (total_obtained / total_maximum) * 100, 2
        )
    else:
        percentage = None

    # Determine overall result
    if pending_subjects > 0 or completed_subjects == 0:
        final_result = 'Incomplete'

    elif failed_subjects:
        final_result = 'Fail'

    else:
        final_result = 'Pass'

    return {
        'subject_results': subject_results,
        'total_obtained': total_obtained,
        'total_maximum': total_maximum,
        'percentage': percentage,
        'result': final_result
    }
