from django.shortcuts import render,redirect,get_object_or_404
from .forms import BookForm
from django.contrib import messages
from .models import Book
# Create your views here.
def home(request):
	return render(request,'home.html')

def add_book(request):
	if request.method == 'POST':
		form = BookForm(request.POST)
		if form.is_valid():
			form.save()
			messages.success(request, 'Book added successfully!')
			return redirect('book_list')  # Redirect to a page showing the list of books
	else:
		form = BookForm()
	return render(request, 'add_book.html', {'form': form})


def book_list(request):
	books = Book.objects.all()
	return render(request, 'book_list.html', {'books': books})

def book_details(request,id):
	book = Book.objects.get(id=id)
	return render(request, 'book_details.html', {'book' :book})

def update_book(request, id):
    book = Book.objects.get(id=id)
    if request.method == 'POST':
        form = BookForm(request.POST, instance=book)
        if form.is_valid():
            form.save()
            messages.success(request, 'Book updated successfully!')
            return redirect('book_details',id = book.id)
    else:
        form = BookForm(instance=book)
    return render(request, 'update.html', {'form': form})

def delete_book(request, id):
    book = get_object_or_404(Book,id=id)
    book.delete()
    messages.success(request, 'Book deleted successfully!')
    return redirect('book_list')
    
