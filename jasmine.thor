class Jasmine < Thor
    include Thor::Actions

    desc "jasmine", "run jasmine spec tests"

    def spec
        run "jasmine-node spec"
    end
end