package io.nosqlbench.virtdata.library.basics.shared.from_long.to_collection;

import io.nosqlbench.virtdata.api.annotations.Categories;
import io.nosqlbench.virtdata.api.annotations.Category;
import io.nosqlbench.virtdata.api.annotations.Example;
import io.nosqlbench.virtdata.api.annotations.ThreadSafeMapper;
import io.nosqlbench.virtdata.api.bindings.VirtDataConversions;

import java.util.HashMap;
import java.util.List;
import java.util.function.LongFunction;
import java.util.function.LongToIntFunction;

/**
 * Create a Map from a long input based on a set of provided key and value functions.
 * Any duplicate entries produced by the key functions are elided.
 *
 * As a 'Pair-wise' function, the size of the resulting collection is determined directly by the
 * number of provided element functions. Since this is a map, the functions come in pairs, each
 * even numbered function is a key function and each odd numbered function is the corresponding value function.
 *
 * As a 'Stepped' function, the input value is incremented before being used by each key or value function.
 */
@Categories({Category.collections})
@ThreadSafeMapper
public class MapStepped implements LongFunction<java.util.Map<Object,Object>> {

    private final List<LongFunction> valueFuncs;
    private final List<LongFunction> keyFuncs;
    private final int size;

    @Example({
            "MapStepped(1, NumberNameToString(),NumberNameToString(),ToString(),ToString())",
            "Create a map of object values. Produces values like {'one':'one'1:1}."
    })
    public MapStepped(Object... funcs) {
        this.keyFuncs = VirtDataConversions.getFunctions(2, 0, LongFunction.class, funcs);
        this.valueFuncs = VirtDataConversions.getFunctions(2,1,LongFunction.class, funcs);
        this.size = keyFuncs.size();
    }

    @Override
    public java.util.Map<Object,Object> apply(long value) {
        java.util.Map<Object,Object> map = new HashMap<>(size);
        for (int i = 0; i < size; i++) {
            int keySelector = Math.min(i, keyFuncs.size() - 1);
            int valSelector = Math.min(i, valueFuncs.size() -1);

            Object keyObject = keyFuncs.get(keySelector).apply(value+i);
            Object valueObject = valueFuncs.get(valSelector).apply(value+i);
            map.put(keyObject,valueObject);
        }
        return map;
    }
}
