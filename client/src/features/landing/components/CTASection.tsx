import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  return (
    <section id="cta" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-indigo-600 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to clear the clutter?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Create your free account and bring your notes, tasks, and snippets together today.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/signup">
              <Button
                variant="secondary"
                className="border-transparent bg-white px-6 py-3 text-indigo-700 hover:bg-indigo-50"
              >
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
