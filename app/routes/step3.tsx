import { TransitionLink } from '~/transition-link';

export const clientLoader = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 600));
  return {};
};

export default function Step2() {
  return (
    <main>
      <h1 className="text-4xl">Step 3</h1>
      <ul className="p-2 gap-2 flex flex-col text-white">
        {Array.from({ length: 20 }).map((_, i) => {
          if (i === 6) {
            return (
              <li key={i} className="h-64 bg-gray-600 odd:bg-gray-500 rounded block">
                <TransitionLink
                  to={'-1'}
                  viewTransitionName="page-default-backward"
                  viewTransition
                  className="size-full flex justify-center items-center text-7xl"
                >
                  <span className="text-lg text-gray-500">zurück zu </span>
                  2
                  <span className="text-lg text-gray-500">{i + 1}</span>
                </TransitionLink>
              </li>
            );
          }

          return (
            <li key={i} className="h-64 bg-gray-600 odd:bg-gray-500 rounded block">
              <TransitionLink
                className="size-full flex justify-center items-center text-7xl"
                viewTransition
                viewTransitionName="page-default-forward"
                to="/step1"
              >
                1
                <span className="text-lg text-gray-200">{i + 1}</span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
